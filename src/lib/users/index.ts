import { User } from "@/types";
import { getDocument, updateDocument } from "../firebase";

export const getUser = async (uid: string) => {
  const user = (await getDocument("users", uid)) as User;
  return user;
};

export const updateUser = async (uid: string, data: any) => {
  await updateDocument("users", uid, data);
};
