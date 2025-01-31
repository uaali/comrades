import { Content } from "@/types";
import ContentCard from "./ContentCard";
import Image from "next/image";
import { truncateText } from "@/utils/truncateText";
import { MdDelete, MdModeEdit } from "react-icons/md";
import EditContentModal from "../modals/EditContentModal";
import { useState } from "react";
import { DeleteContentModal } from "../modals/DeleteContentModal";

const DashboardContentContainer = ({
  content,
  editable,
}: {
  content: Content[];
  editable: boolean;
}) => {
  const [editContentModalOpen, setEditContentModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [deleteContentModalOpen, setDeleteContentModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  function formatDate(date: Date) {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("en-US", options);
    }

    return date.getFullYear().toString();
  }
  return (
    <div>
      {selectedContent && (
        <EditContentModal
          content={selectedContent}
          modalOpen={editContentModalOpen}
          setModalOpen={setEditContentModalOpen}
        />
      )}

      {selectedDeleteId && selectedContent && (
        <DeleteContentModal
          userId={selectedContent?.publisher}
          contentId={selectedDeleteId}
          openModal={deleteContentModalOpen}
          setOpenModal={setDeleteContentModalOpen}
        />
      )}
      {editable ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {content.map((item) => (
            <div
              key={item.id}
              className="rounded relative flex-col shadow overflow-hidden border-primary-200 border w-40 font-inter justify-between flex"
            >
              <div className="absolute top-0 right-0 flex gap-4 items-center p-2">
                <MdModeEdit
                  onClick={() => {
                    setSelectedContent(item);
                    setEditContentModalOpen(true);
                  }}
                  className="hover:cursor-pointer text-blue-600 w-6 h-6"
                />
                <MdDelete
                  onClick={() => {
                    setSelectedContent(item);
                    setSelectedDeleteId(item.id);
                    setDeleteContentModalOpen(true);
                  }}
                  className="hover:cursor-pointer text-red-600 w-6 h-6"
                />
              </div>
              <Image
                src={item.previewUrl}
                width={200}
                height={200}
                alt={item.title}
                className="w-40 h-40"
              />
              <div className="my-2 px-1 flex flex-col h-auto justify-between flex-1">
                <div className="space-y-1">
                  <p className="font-bold text-sm">
                    {truncateText(item.title, 50)}
                  </p>
                  <p className="text-sm">
                    {truncateText(item.description, 60)}
                  </p>
                </div>
                <div className="flex justify-between items-center my-1">
                  <p className="font-bold text-primary-200">
                    Ksh. {item.price}
                  </p>
                  <p className="text-xs text-gray-400 font-light">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {content.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardContentContainer;
