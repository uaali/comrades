const functions = require("firebase-functions/v1");
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");
const {
  onObjectFinalized,
  onObjectDeleted,
} = require("firebase-functions/v2/storage");
const { defineSecret } = require("firebase-functions/params");
const { setGlobalOptions } = require("firebase-functions/v2");
const { ImageAnnotatorClient } = require("@google-cloud/vision");
const admin = require("firebase-admin");
const { isProfane } = require("no-profanity");
const { Timestamp } = require("firebase-admin/firestore");
const { error } = require("firebase-functions/logger");
const { PdfCounter } = require("page-count");
const { genkit } = require("genkit");
const { default: vertexAI, gemini15Pro } = require("@genkit-ai/vertexai");
const SUPPORTED_MIME_TYPES = require("./supportedMimes");
const { Readable } = require("stream");
const { getVideoDurationInSeconds } = require("get-video-duration");

// Set global options (e.g., region)
setGlobalOptions({ region: "us-central1" });

const intasendApiKey = defineSecret("INTASEND_SECRET_API_KEY");
const authFirebasePrivateKey = defineSecret("AUTH_FIREBASE_PRIVATE_KEY");
const authFirebaseClientEmail = defineSecret("AUTH_FIREBASE_CLIENT_EMAIL");
const authFirebaseProjectId = defineSecret("AUTH_FIREBASE_PROJECT_ID");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket();

// 1. Create user document on authentication
exports.createUserDocument = functions
  .runWith({ secrets: [intasendApiKey] })
  .auth.user()
  .onCreate(async (user) => {
    const FREE_QUOTA = 2.5 * 1024 * 1024 * 1024;
    try {
      const response = await fetch(
        "https://payment.intasend.com/api/v1/wallets/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${intasendApiKey.value()}`,
          },
          body: JSON.stringify({
            currency: "KES",
            wallet_type: "WORKING",
            can_disburse: true,
            label: `v2${user.uid}`,
          }),
        }
      );

      const responseData = await response.json();

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: user.metadata.creationTime,
        walletId: responseData.wallet_id,
        tokenBalance: 0,
      };

      const batch = db.batch();

      const notification = {
        title: `Welcome to the platform, ${user.displayName}`,
        message: `We are excited to have you on board. You can now start earning by selling digital content online. Click the link below to get started.`,
        read: false,
        timestamp: Timestamp.now(),
        userId: user.uid,
        link: "/upload",
      };

      const userDocRef = db.collection("users").doc(user.uid);
      batch.set(userDocRef, userData);
      const notificationDocRef = db.collection("notifications").doc();
      batch.set(notificationDocRef, notification);
      const quotaRef = db.collection("userQuotas").doc(user.uid);
      batch.set(quotaRef, {
        totalStorageUsed: 0,
        storageLimit: FREE_QUOTA,
        lastPaymentDate: null,
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  });

// 2. Check uploaded documents for profanity and NSFW content
exports.onUploadDocumentCreated = onDocumentCreated(
  {
    document: "uploads/{documentId}",
    secrets: [
      authFirebasePrivateKey,
      authFirebaseClientEmail,
      authFirebaseProjectId,
    ],
  },
  async (event) => {
    try {
      const snapshot = event.data;
      const document = snapshot.data();
      const documentId = event.params.documentId;
      const userId = document.publisher;

      const visionClient = new ImageAnnotatorClient({
        credentials: {
          client_email: authFirebaseClientEmail.value(),
          private_key: authFirebasePrivateKey.value()?.replace(/\\n/g, "\n"),
        },
        projectId: authFirebaseProjectId.value(),
      });

      const sendNotification = async (message) => {
        const notification = {
          title: `Document deleted`,
          message: message,
          read: false,
          timestamp: Timestamp.now(),
          userId: userId,
        };

        const notificationDocRef = db.collection("notifications").doc();
        await notificationDocRef.set(notification);
      };

      const deleteAllResources = async () => {
        await bucket.file(`uploads/${userId}/${documentId}/file`).delete();
        await bucket.file(`uploads/${userId}/${documentId}/preview`).delete();
        await db.collection("uploads").doc(documentId).delete();
      };

      // Check for profanity
      const hasProfanity =
        isProfane(document.title) ||
        isProfane(document.description) ||
        (document.tags && document.tags.some((tag) => isProfane(tag)));

      if (hasProfanity) {
        await deleteAllResources();
        await sendNotification("Document deleted due to profanity");
        return;
      }

      // Check for faces & explicit content
      if (document.previewUrl) {
        const [faceResult] = await visionClient.faceDetection(
          document.previewUrl
        );
        if ((faceResult.faceAnnotations || []).length > 0) {
          await deleteAllResources();
          await sendNotification(
            "Document deleted due to faces detected in preview image. Please do not upload images with faces."
          );
          return;
        }

        const [safeSearchResult] = await visionClient.safeSearchDetection(
          document.previewUrl
        );
        const safeSearch = safeSearchResult.safeSearchAnnotation;

        if (
          safeSearch &&
          (safeSearch.adult === "LIKELY" ||
            safeSearch.adult === "VERY_LIKELY" ||
            safeSearch.violence === "LIKELY" ||
            safeSearch.violence === "VERY_LIKELY" ||
            safeSearch.racy === "LIKELY" ||
            safeSearch.racy === "VERY_LIKELY")
        ) {
          await deleteAllResources();
          await sendNotification(
            "Document deleted due to NSFW content detected in preview image. This platform does not allow explicit content."
          );
          return;
        }
      }
    } catch (err) {
      error("Error processing new document:", err);
    }
  }
);

const MAX_DOC_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_PDF_PAGES = 1000;

// 3. Increase user quota && generate summary when file is uploaded
exports.onFileUploaded = onObjectFinalized(
  { bucket: storage.bucket().name },
  async (event) => {
    try {
      if (!event.data.name) return;
      const pathParts = event.data.name.split("/");
      if (pathParts[0] !== "uploads" || pathParts.length !== 4) return;

      const userId = pathParts[1];
      const fileSize = parseInt(event.data.size);
      const fileType = event.data.contentType;
      const contentId = pathParts[2];

      const quotaRef = db.collection("userQuotas").doc(userId);

      await quotaRef.update({
        totalStorageUsed: admin.firestore.FieldValue.increment(fileSize),
      });

      const type = pathParts[3];

      if (type !== "file") {
        return null;
      }

      if (!SUPPORTED_MIME_TYPES.has(fileType)) {
        return null;
      }
      if (
        (fileType === "application/pdf" || fileType === "text/plain") &&
        fileSize > MAX_DOC_SIZE_BYTES
      ) {
        return null;
      }
      let pdfPages = 0;
      if (fileType === "application/pdf") {
        const file = bucket.file(event.data.name);
        const [pdfBuffer] = await file.download();
        pdfPages = PdfCounter.count(pdfBuffer);
        if (pdfPages > MAX_PDF_PAGES) {
          return null;
        }
      }

      const ai = genkit({
        plugins: [vertexAI({ location: "us-central1" })],
        model: gemini15Pro,
      });

      const results = await ai.generate([
        {
          media: {
            url: `gs://${storage.bucket().name}/${event.data.name}`,
            contentType: fileType,
          },
        },
        {
          text: `
    You are a strict quality assurance officer. Your task is to verify the authenticity and usefulness of this media.
    - Summarize the content concisely without revealing sensitive details.
    - Highlight its authenticity, usefulness, and value to encourage purchase.
    - If the file appears blank or contains no meaningful content, clearly indicate this.
    Generate a very short professional summary of the file.
    `,
        },
      ]);

      const summary = results.message.content[0].text;
      const totalTokensUsed = results.usage.totalTokens;
      let equivalentChatGPTTokens = totalTokensUsed * 17;

      //pricing(vertex ai)
      if (fileType === "application/pdf") {
        equivalentChatGPTTokens += pdfPages * 53;
      }
      if (fileType === "text/plain") {
        const inputTokens = results.usage.inputTokens;
        const characters = inputTokens * 4;
        equivalentChatGPTTokens += Number((characters * 0.05).toFixed(0));
      }
      if (fileType.startsWith("image/")) {
        equivalentChatGPTTokens += 53;
      }
      if (fileType.startsWith("video/")) {
        const file = bucket.file(event.data.name);
        const [videoBuffer]= await file.download();
        const readableStream = Readable.from(videoBuffer);
        const duration = await getVideoDurationInSeconds(readableStream);
        equivalentChatGPTTokens += duration * 53;
      }
      if (fileType.startsWith("audio/")) {
        equivalentChatGPTTokens + 96000;
      }

      const uploadRef = db.collection("uploads").doc(contentId);
      const summaryRef = db.collection("summaries").doc(contentId);
      await uploadRef.update({
        summaryAvailable: true,
      });
      await summaryRef.set({
        summary: summary,
        tokensUsed: equivalentChatGPTTokens,
      });
    } catch (error) {
      console.error("Error here bro:", error);
    }
  }
);

// 4. Decrease user quota when file is deleted
exports.onFileDeleted = onObjectDeleted(
  { bucket: storage.bucket().name },
  async (event) => {
    try {
      if (!event.data.name) return;

      const pathParts = event.data.name.split("/");
      if (pathParts[0] !== "uploads" || pathParts.length !== 4) return;

      const userId = pathParts[1];
      const fileSize = parseInt(event.data.size);

      const quotaRef = db.collection("userQuotas").doc(userId);

      await quotaRef.update({
        totalStorageUsed: admin.firestore.FieldValue.increment(-fileSize),
      });
    } catch (error) {
      console.error("Error updating user quota:", error);
    }
  }
);

// When a document is updated, check for profanity
exports.onUploadDocumentUpdated = onDocumentUpdated(
  {
    document: "uploads/{documentId}",
  },
  async (event) => {
    try {
      const document = event.data.after.data();
      const documentId = event.params.documentId;
      const userId = document.publisher;

      const previousTitle = event.data.before.data().title;
      const previousDescription = event.data.before.data().description;
      if (
        document.title === previousTitle &&
        document.description === previousDescription
      ) {
        return null;
      }

      const sendNotification = async (message) => {
        const notification = {
          title: `Document deleted`,
          message: message,
          read: false,
          timestamp: Timestamp.now(),
          userId: userId,
        };

        const notificationDocRef = db.collection("notifications").doc();
        await notificationDocRef.set(notification);
      };

      const deleteAllResources = async () => {
        await bucket.file(`uploads/${userId}/${documentId}/file`).delete();
        await bucket.file(`uploads/${userId}/${documentId}/preview`).delete();
        await db.collection("uploads").doc(documentId).delete();
      };

      const hasProfanity =
        isProfane(document.title) || isProfane(document.description);

      if (hasProfanity) {
        await deleteAllResources();
        await sendNotification("Document deleted due to profanity");
        return;
      }
    } catch (err) {
      error("Error updating document:", err);
    }
  }
);
