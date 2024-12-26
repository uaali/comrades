import Link from "next/link";
import React from "react";
import { MdAdd } from "react-icons/md";

const UploadBanner = () => {
  return (
    <div className="w-1/2 md:w-3/4 h-auto bg-[#E7E5FF] flex items-center justify-center font-inter flex-col gap-2 rounded">
      <p className="text-text-50">
        Start Making <span className="text-primary-200">Money</span>
      </p>
      <Link
        href="/upload"
        className="bg-accent-200 text-white py-2 px-3 rounded-lg flex gap-1"
      >
        <MdAdd className="w-5 h-5" />
        <p>Upload</p>
      </Link>
    </div>
  );
};

export default UploadBanner;
