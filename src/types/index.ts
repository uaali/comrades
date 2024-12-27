import { FileWithPath } from "react-dropzone";

export interface User {
  uid: string;
  displayName: string | null;
  walletId?: string | null;
  tokenBalance?: number | null;
}

export interface ImageWithPreview extends FileWithPath {
  preview: string;
}

export interface UploadFormData {
  title: string;
  description: string;
  price: number;
  tags: string[];
}

export interface UploadFormDataWithFiles extends UploadFormData {
  publisher: string;
  file: File | string;
  preview: File | string;
  fileMimeType: string;
  previewMimeType: string;
}

export interface UserQuota {
  totalStorageUsed: number;
  storageLimit: number;
  lastPaymentDate?: Date;
}
