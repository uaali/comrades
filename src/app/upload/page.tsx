"use client";

import { useState } from "react";
import UploadFilesDropzone from "../components/ui/UploadFilesDropzone";
import UploadPreviewFileDropzone from "../components/ui/UploadPreviewFileDropzone";
import TagsInput from "../components/sections/TagsInput";
import { UploadFormData } from "@/types";
import toast from "react-hot-toast";

const baseStyle = {
  height: "200px",
  overflow: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#2f27ce",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const UploadPage = () => {
  const [files, setFiles] = useState<File[] | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    price: 0,
    description: "",
    tags: [],
  });

  const validateForm = () => {
    if (!formData.title) {
      toast.error("Title is required");
      return false;
    }
    if (formData.price <= 9) {
      toast.error("Price must be greater than 0");
      return false;
    }
    if (!formData.description) {
      toast.error("Description is required");
      return false;
    }
    if (!files || files.length === 0) {
      toast.error("Content files are required");
      return false;
    }
    if (!previewFile) {
      toast.error("Preview image is required");
      return false;
    }
    if (formData.tags.length === 0) {
      toast.error("At least one tag is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      toast.loading("Uploading content...");
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.dismiss();
      toast.success("Content uploaded successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to upload content");
    }
  };
  return (
    <div className="p-4 md:px-6 bg-background-200 text-text-50 w-full">
      <p className="font-poppinsB text-lg md:text-2xl font-bold tracking-wide text-center md:text-left">
        New Content
      </p>
      <div className="flex md:flex-row w-full justify-between gap-3 mt-5 flex-col">
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="title"
            className="text-sm tracking-wide font-semibold"
          >
            Title
          </label>
          <input
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            maxLength={100}
            type="text"
            name="title"
            placeholder="Title"
            className="rounded-lg border-primary-500 shadow-lg p-2"
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="price"
            className="text-sm tracking-wide font-semibold"
          >
            Price (Ksh) <span className="text-gray-500 font-normal">-Minimum 10</span>
          </label>
          <input
            onChange={(e) =>
              setFormData({ ...formData, price: parseInt(e.target.value) })
            }
            type="number"
            name="price"
            placeholder="Selling Price"
            className="rounded-lg border-primary-500 shadow-lg p-2"
          />
        </div>
      </div>
      <div className="flex md:flex-row w-full justify-between gap-3 mt-5 flex-col">
        <div className="flex flex-col gap-2 w-full">
          <p className="text-sm tracking-wide font-semibold">Content</p>
          <UploadFilesDropzone baseStyle={baseStyle} setFiles={setFiles} />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <p className="text-sm tracking-wide font-semibold">Preview Image</p>
          <UploadPreviewFileDropzone
            baseStyle={baseStyle}
            setPreviewFile={setPreviewFile}
          />
        </div>
      </div>
      <div>
        <div className="flex flex-col gap-2 mt-5">
          <label className="text-sm tracking-wide font-semibold">
            Description
          </label>
          <textarea
            maxLength={500}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            name="description"
            placeholder="Add a detailed description..."
            className="rounded-lg border-primary-500 shadow-lg p-2 min-h-[100px]"
          />
        </div>
        <TagsInput
          setResultTags={(tags) => setFormData({ ...formData, tags: tags })}
        />
      </div>
      <div className="w-full justify-center flex">
        <button
          onClick={() => handleSubmit()}
          className="bg-accent-200 text-lg font-bold tracking-wide text-white px-6 py-3 mt-8 mb-12 rounded-lg"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
