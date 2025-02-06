"use client";

import { useState } from "react";
import UploadFilesDropzone from "../components/ui/UploadFilesDropzone";
import UploadPreviewFileDropzone from "../components/ui/UploadPreviewFileDropzone";
import TagsInput from "../components/sections/TagsInput";
import { UploadFormData } from "@/types";
import toast from "react-hot-toast";
import { compressFiles, getFileExtension, validateForm } from "../../utils/uploadFileUtils";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, provider, storage } from "@/lib/firebase/config";
import CourseSelection from "../components/ui/CourseSelection";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  useCollectionOnce,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import StorageUsage from "../components/ui/StorageUsage";
import BuyStorage from "../components/modals/BuyStorage";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createHash } from "crypto";

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
  const [buyStorageModalOpen, setBuyStorageModalOpen] = useState(false);

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

  const [courses, loading] = useCollectionOnce(coursesQuery);

  const [storageQuota] = useDocumentData(
    user ? doc(db, "userQuotas", user.uid) : null
  );

  const router = useRouter();

  const handleSubmit = async () => {
    let newFormData = { ...formData, course: selectedCourse };
    if (!user) {
      toast.error("You need to be logged in to upload content");
      await signInWithPopup(auth, provider);
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
    const validation = validateForm(newFormData);
    if (validation !== true) {
      toast.error(validation);
      setSubmitting(false);
      return;
    }

    try {
      toast.loading("Uploading content...");
      const contentId = doc(collection(db, "uploads")).id;

      const fileName = `TirigistFile.${getFileExtension(compressedFile.name)}`;
      const fileRef = ref(storage, `uploads/${user.uid}/${contentId}/file`);
      await uploadBytes(fileRef, compressedFile,{
        contentDisposition: `attachment; filename="${fileName}"`,
      });

      const previewRef = ref(
        storage,
        `uploads/${user.uid}/${contentId}/preview`
      );
      await uploadBytes(previewRef, previewFile);

      //save course
      if (newFormData.course !== "" && formData.courseExisted === false) {
        const courseRef = doc(
          db,
          "courses",
          createHash("sha256").update(newFormData.course).digest("hex")
        );
        await setDoc(courseRef, {
          name: newFormData.course,
        });
      }

      const previewUrl = await getDownloadURL(previewRef);

      delete newFormData.courseExisted;

      //save to firestore
      const docRef = doc(db, "uploads", contentId);
      await setDoc(docRef, {
        downloads: 0,
        publisher: user.uid,
        previewUrl,
        ...newFormData,
        createdAt: serverTimestamp(),
      });

      toast.dismiss();
      toast.success("Content uploaded successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to upload content");
      setSubmitting(false);
    }
  };
  return (
    <div className="p-4 md:px-6 bg-background-200 text-text-50 w-full">
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center">
        <p className="font-poppinsB text-lg md:text-2xl font-bold tracking-wide text-center md:text-left">
          New Content
        </p>
        {storageQuota && (
          <div className="max-w-md w-full flex gap-2 items-center">
            <StorageUsage
              currentStorage={storageQuota.totalStorageUsed}
              totalStorage={storageQuota.storageLimit}
            />
            <p className="text-nowrap">
              {(storageQuota.totalStorageUsed / (1024 * 1024 * 1024)).toFixed(
                2
              )}{" "}
              GB /{" "}
              {(storageQuota.storageLimit / (1024 * 1024 * 1024)).toFixed(2)} GB
            </p>
            <button
              onClick={() => setBuyStorageModalOpen(true)}
              className="text-accent-200 text-sm underline text-nowrap"
            >
              Buy Storage
            </button>
          </div>
        )}
      </div>
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
              placeholder="Enter course name"
              selectedCourse={selectedCourse}
              setSearchValue2={(searchValue) => setSelectedCourse(searchValue)}
              courses={courses.docs.map((course) => course.data().name)}
              setCourseExisted={(value) =>
                setFormData({ ...formData, courseExisted: value })
              }
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
            submitting && "opacity-40 hover:cursor-wait"
          } bg-accent-200 text-lg font-bold tracking-wide text-white px-6 py-3 mt-8 mb-12 rounded-lg`}
        >
          {submitting ? "Uploading..." : "Upload"}
        </button>
      </div>
      {user && (
        <BuyStorage
          user={user}
          openModal={buyStorageModalOpen}
          setOpenModal={setBuyStorageModalOpen}
        />
      )}
    </div>
  );
};

export default UploadPage;
