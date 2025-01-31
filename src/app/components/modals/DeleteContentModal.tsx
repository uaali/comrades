"use client";

import { db, storage } from "@/lib/firebase/config";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdWarning } from "react-icons/md";

export function DeleteContentModal({
  openModal,
  setOpenModal,
  contentId,
  userId,
}: {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  contentId: string;
  userId: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const deleteContent = async () => {
    setDeleting(true);
    toast.loading("Deleting content...");
    const docRef = doc(db, "uploads", contentId);
    const fileRef = ref(storage, `uploads/${userId}/${contentId}/file`);
    const previewRef = ref(storage, `uploads/${userId}/${contentId}/preview`);
    await deleteDoc(docRef);
    await deleteObject(fileRef);
    await deleteObject(previewRef);
    toast.success("Content deleted successfully");
    setDeleting(false);
    setOpenModal(false);
    window.location.reload();
  };
  return (
    <Modal
      show={openModal}
      size="md"
      onClose={() => setOpenModal(false)}
      popup
      dismissible
    >
      <Modal.Header />
      <Modal.Body>
        <div className="text-center">
          <MdWarning className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this content?
          </h3>
          <div className="flex justify-center gap-4">
            <Button
              color="failure"
              disabled={deleting}
              onClick={async () => await deleteContent()}
            >
              {deleting ? "Deleting..." : <p>Yes &#128527; , I'm sure</p>}
            </Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>
              No &#128543;, cancel
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
