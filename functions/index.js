const functions = require("firebase-functions/v1");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
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
      const document = event.data;
      const documentId = event.params.documentId;
      const userId = document.publisher;

      const visionClient = new ImageAnnotatorClient({
        credentials: {
          client_email: authFirebaseClientEmail.value(),
          private_key: authFirebasePrivateKey.value()?.replace(/\\n/g, "\n"),
        },
        projectId: authFirebaseProjectId.value(),
      });

      // Check for profanity
      const hasProfanity =
        isProfane(document.title) ||
        isProfane(document.description) ||
        (document.tags && document.tags.some((tag) => isProfane(tag)));

      if (hasProfanity) {
        await bucket.file(`uploads/${userId}/${documentId}/file`).delete();
        await bucket.file(`uploads/${userId}/${documentId}/preview`).delete();
        await db.collection("uploads").doc(documentId).delete();
        return;
      }

      // Check for faces & explicit content
      if (document.previewUrl) {
        const [faceResult] = await visionClient.faceDetection(
          document.previewUrl
        );
        if ((faceResult.faceAnnotations || []).length > 0) {
          await bucket.file(`uploads/${userId}/${documentId}/file`).delete();
          await bucket.file(`uploads/${userId}/${documentId}/preview`).delete();
          await db.collection("uploads").doc(documentId).delete();
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
          await bucket.file(`uploads/${userId}/${documentId}/file`).delete();
          await bucket.file(`uploads/${userId}/${documentId}/preview`).delete();
          await db.collection("uploads").doc(documentId).delete();
          return;
        }
      }
    } catch (error) {
      console.error("Error processing new document:", error);
    }
  }
);

// 3. Increase user quota when file is uploaded
exports.onFileUploaded = onObjectFinalized(
  { bucket: storage.bucket().name },
  async (event) => {
    try {
      if (!event.data.name) return;
      const pathParts = event.data.name.split("/");
      if (pathParts[0] !== "uploads" || pathParts.length !== 4) return;

      const userId = pathParts[1];
      const fileSize = parseInt(event.data.size)

      const quotaRef = db.collection("userQuotas").doc(userId);

      await quotaRef.update({
        totalStorageUsed: admin.firestore.FieldValue.increment(fileSize),
      });
    } catch (error) {
      console.error("Error updating user quota:", error);
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
      const fileSize = parseInt(event.data.size)

      const quotaRef = db.collection("userQuotas").doc(userId);

      await quotaRef.update({
        totalStorageUsed: admin.firestore.FieldValue.increment(-fileSize),
      });
    } catch (error) {
      console.error("Error updating user quota:", error);
    }
  }
);
