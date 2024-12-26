import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY
        ? process.env.AUTH_FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
        : undefined,
      clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
      projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
    }),
    storageBucket: process.env.AUTH_FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();
const storage = admin.storage().bucket(process.env.AUTH_FIREBASE_STORAGE_BUCKET);

//save data to firestore
async function createDocument(
  collectionName: string,
  data: any,
  docId?: string
) {
  try {
    const collection = db.collection(collectionName);
    if (docId) {
      collection.doc(docId).set(data);
    } else {
      await collection.add(data);
    }
  } catch (error) {
    console.error("Error saving to collection:", error);
    throw error;
  }
}

async function getDocuments(collection: string, conditions: any[]) {
  let query: any = db.collection(collection);
  conditions.forEach((condition) => {
    query = query.where(condition.field, condition.operator, condition.value);
  });
  const snapshot = await query.get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

async function updateDocument(collection: string, id: string, data: any) {
  await db.collection(collection).doc(id).update(data);
}

async function deleteDocument(collection: string, id: string) {
  await db.collection(collection).doc(id).delete();
}

export {
  db,
  storage,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
};
