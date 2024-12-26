import JSZip from "jszip";

export const compressFiles = async (files: File[]): Promise<File> => {
  const zip = new JSZip();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    zip.file(file.name, arrayBuffer);
  }

  const content = await zip.generateAsync({ type: "blob" });
  return new File([content], "content.zip", { type: "application/zip" });
};
