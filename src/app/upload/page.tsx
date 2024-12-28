"use client";

import { useState } from "react";
import UploadFilesDropzone from "../components/ui/UploadFilesDropzone";
import UploadPreviewFileDropzone from "../components/ui/UploadPreviewFileDropzone";
import TagsInput from "../components/sections/TagsInput";
import { UploadFormData } from "@/types";
import toast from "react-hot-toast";
import { compressFiles, validateForm } from "../utils/uploadFileUtils";
import { toBase64 } from "../utils/toBase64";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase/config";
import CourseSelection from "../components/ui/CourseSelection";
import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

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
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    price: 0,
    description: "",
    course: "",
    tags: [],
    courseExisted: false,
  });
  const [user] = useAuthState(auth);
  const coursesQuery = collection(db, "courses");

  const [courses, loading] = useCollection(coursesQuery);

  const handleSubmit = async () => {
    const newFormData = { ...formData, course: selectedCourse };
    if (!user) {
      toast.error("You need to be logged in to upload content");
      return;
    }
    setSubmitting(true);
    if (!files || !previewFile) {
      toast.error("Content file(s) and preview image are required");
      setSubmitting(false);
      return;
    }
    toast.loading("Compressing files...");
    const compressedFile = await compressFiles(files);
    toast.dismiss();
    const data = {
      ...newFormData,
      publisher: user?.uid,
      file: await toBase64(compressedFile),
      preview: await toBase64(previewFile),
      fileMimeType: compressedFile.type,
      previewMimeType: previewFile.type,
    };
    const validation = validateForm(data);
    if (validation !== true) {
      toast.error(validation);
      setSubmitting(false);
      return;
    }

    try {
      toast.loading("Uploading content...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.dismiss();
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to upload content");
      }
      toast.success("Content uploaded successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error(
        error instanceof Error ? error.message : "Failed to upload content"
      );
    }
    setSubmitting(false);
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
            Price (Ksh){" "}
            <span className="text-gray-500 font-normal">-Minimum 10</span>
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
          <p className="text-sm tracking-wide font-semibold">Description</p>
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
        <div className="flex flex-col gap-2 mt-5">
          <p className="text-sm tracking-wide font-semibold">
            Select Course{" "}
            <span className="text-gray-500 font-normal">-Recommended</span>
          </p>
          {courses && !loading ? (
            <CourseSelection
              placeholder="Select Course"
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              courses={courses.docs.map((course) => course.data().name)}
            />
          ) : (
            <div className="p-3 bg-gray-200 rounded-lg animate-pulse"></div>
          )}
        </div>
        <TagsInput
          setResultTags={(tags) => setFormData({ ...formData, tags: tags })}
        />
      </div>
      <div className="w-full justify-center flex">
        <button
          disabled={submitting}
          onClick={() => handleSubmit()}
          className={`${
            submitting && "opacity-40"
          } bg-accent-200 text-lg font-bold tracking-wide text-white px-6 py-3 mt-8 mb-12 rounded-lg`}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
