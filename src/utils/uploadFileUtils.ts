import { UploadFormData } from "@/types";
import JSZip from "jszip";

export const compressFiles = async (files: File[]): Promise<File> => {
  if (files.length === 1) {
    return files[0];
  }
  const zip = new JSZip();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    zip.file(file.name, arrayBuffer);
  }
  const content = await zip.generateAsync({ type: "blob" });
  return new File([content], "content.zip", { type: "application/zip" });
};

export const validateForm = (data: UploadFormData) => {
  if (!data.title) {
    return "Title is required";
  }
  if (data.title.length > 100) {
    return "Title is too long (100 characters max)";
  }
  if (data.price <= 9) {
    return "Minimum selling price is 10";
  }
  if (!data.description) {
    return "Description is required";
  }
  if (data.description.length > 500) {
    return "Description is too long (500 characters max)";
  }
  if (data.tags.length === 0) {
    return "At least one tag is required";
  }
  if (data.tags.length > 6) {
    return "Maximum of 6 tags allowed";
  }
  return true;
};
