import Images2PDF from "@/app/components/pages/Images2PDF";
import { Metadata } from "next";
import { FiFileText } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Image(s) to PDF Converter",
  description:
    "Convert your images to PDF files easily. Supports JPG, JPEG, PNG, and GIF formats.",
  keywords: [
    "image converter",
    "pdf converter",
    "image to pdf",
    "file conversion",
  ],
  openGraph: {
    title: "Images to PDF Converter",
    description:
      "Convert your images to PDF files easily. Supports JPG, JPEG, PNG, and GIF formats.",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 flex-col gap-3">      
      <h1 className="text-xl md:text-2xl font-bold text-center text-blue-600 flex items-center justify-center gap-2 text-nowrap">
        <FiFileText className="w-8 h-8" /> Image(s) to PDF Converter
      </h1>
      <Images2PDF />
    </div>
  );
}
