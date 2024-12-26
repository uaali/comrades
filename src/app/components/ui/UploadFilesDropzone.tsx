import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
const focusedStyle = {
  borderColor: "#dddbff",
};

const acceptStyle = {
  borderColor: "#2f27ce",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const UploadFilesDropzone = ({
  baseStyle,
  setFiles,
}: {
  baseStyle: any;
  setFiles: (value: File[]) => void;
}) => {
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop: (files) => {
      setFiles(files);
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

  const files = acceptedFiles.map((file) => (
    <li
      key={file.path}
      className="w-28 text-xs text-text-50 overflow-hidden h-8 bg-gray-200 text-nowrap p-2 rounded"
    >
      {file.path}
    </li>
  ));
  return (
    <section className="h-full">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {files.length > 0 ? (
          <ul className="flex flex-row flex-wrap gap-4">{files}</ul>
        ) : (
          <p className="text-center">
            <span className="hidden md:block">
              Drag 'n' drop some files here, or{" "}
            </span>
            Click to select files
          </p>
        )}
      </div>
    </section>
  );
};

export default UploadFilesDropzone;
