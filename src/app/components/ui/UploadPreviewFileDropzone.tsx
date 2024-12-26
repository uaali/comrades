import { ImageWithPreview } from "@/types";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
const focusedStyle = {
  borderColor: "#dddbff",
};

const acceptStyle = {
  borderColor: "#dddbff",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const UploadPreviewFileDropzone = ({
  baseStyle,
  setPreviewFile,
}: {
  baseStyle: any;
  setPreviewFile: (value: File) => void;
}) => {
  const [file, setFile] = useState<ImageWithPreview>();

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length != 1) return;
      setFile(
        Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0]),
        })
      );
      setPreviewFile(acceptedFiles[0]);
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  useEffect(() => {
    if (!file) return;
    return () => URL.revokeObjectURL(file.preview);
  }, [file]);
  return (
    <section className="h-full">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {acceptedFiles.length > 0 ? (
          <div>
            {file ? (
              <Image
                src={file.preview}
                alt={`${acceptedFiles[0].path}`}
                width={100}
                onLoad={() => {
                  URL.revokeObjectURL(file.preview);
                }}
                className="rounded border"
                height={200}
              />
            ) : (
              <div className="w-12 h-24 bg-gray-200 rounded animate-pulse"></div>
            )}
          </div>
        ) : (
          <p className="text-center">
            <span className="hidden md:block">
              Drag 'n' drop an image here, or{" "}
            </span>
            Click to select file
          </p>
        )}
      </div>
    </section>
  );
};

export default UploadPreviewFileDropzone;
