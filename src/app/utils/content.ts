import {
  createDocument,
  db,
  storage,
  updateDocument,
} from "@/lib/firebase/admin";
import { UserQuota } from "@/types";
import { Timestamp } from "firebase-admin/firestore";
import { getDownloadURL } from "firebase-admin/storage";

const FREE_QUOTA = 1024 * 1024 * 1024; // 1GB in bytes
const PAID_QUOTA_PRICE = 10; // 10ksh

export const uploadContent = async ({
  file,
  previewFile,
  data,
}: {
  file: Buffer;
  previewFile: Buffer;
  data: any;
}) => {
  try {
    //upload preview file
    const contentId = db.collection("uploads").doc().id;
    const previewRef = storage.file(
      `uploads/${contentId}/preview/${crypto.randomUUID()}`
    );
    await previewRef.save(previewFile, {
      metadata: { contentType: data.previewMimeType },
    });
    const previewUrl = await getDownloadURL(previewRef);

    //upload file
    const fileRef = storage.file(
      `uploads/${contentId}/full/${crypto.randomUUID()}`
    );
    await fileRef.save(file, { metadata: { contentType: data.fileMimeType } });

    //remove mimeTypes
    delete data.previewMimeType;
    delete data.fileMimeType;

    //save data to firestore
    await createDocument(
      "uploads",
      { ...data, previewUrl, contentId, createdAt: Timestamp.now() },
      contentId
    );
  } catch (error) {
    console.log("Error uploading content:", error);
    throw error;
  }
};

export async function checkQuota(
  userId: string,
  fileSize: number
): Promise<boolean> {
  const userQuotaRef = db.collection("userQuotas").doc(userId);

  try {
    // Get user's current quota usage
    const quotaDoc = await userQuotaRef.get();
    let quotaData = quotaDoc.data() as UserQuota;

    // If no quota document exists, create one
    if (!quotaDoc.exists) {
      await createDocument(
        "userQuotas",
        {
          totalStorageUsed: 0,
          storageLimit: FREE_QUOTA,
          lastPaymentDate: null,
        },
        userId
      );
      return true;
    }

    // Check if upload would exceed quota
    if (quotaData.totalStorageUsed + fileSize > quotaData.storageLimit) {
      return false; // Quota would be exceeded
    }

    //update quota usage
    await updateDocument("userQuotas", userId, {
      totalStorageUsed: quotaData.totalStorageUsed + fileSize,
    });

    return true; // Upload is allowed
  } catch (error) {
    console.error("Error checking quota:", error);
    throw error;
  }
}
