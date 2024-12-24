import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

export const getDocument = async (
  collectionName: string,
  documentId: string
) => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return false;
  }
};

export const updateDocument = async (
  collectionName: string,
  documentId: string,
  data: any
) => {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, data);
};
