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
  });
}

const db = admin.firestore();

//save data to firestore
async function saveToCollection(
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

export { db,saveToCollection };
