import { Timestamp } from "firebase-admin/firestore";
import { FileWithPath } from "react-dropzone";

export interface User {
  uid: string;
  displayName: string | null;
  walletId: string | null;
  tokenBalance: number | null;
}

export interface ImageWithPreview extends FileWithPath {
  preview: string;
}

export interface UploadFormData {
  title: string;
  description: string;
  price: number;
  course: string;
  tags: string[];
  courseExisted?: boolean;
}

export interface UploadFormDataWithFiles extends UploadFormData {
  publisher: string;
  file?: File | string;
  preview?: File | string;
}

export interface UserQuota {
  totalStorageUsed: number;
  storageLimit: number;
  lastPaymentDate?: Date;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  price: number;
  course: string;
  tags: string[];
  publisher: string;
  contentId: string;
  previewUrl: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  checkoutId: string | null;
  trackingId: string | null;
  signature: string | null;
  userId: string;
  contentId: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "canceled";
  createdAt: Timestamp | Date;
  paymentMethod: string | null;
  referrer: string | null;
  charges: number;
  netAmount: number;
}

export interface Withdrawal {
  id: string;
  amount: number;
  createdAt: Timestamp | Date;
  phone: string;
  userId: string;
  walletId: string;
}

