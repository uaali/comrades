import { updateDocument } from "@/lib/firebase";
import { Content } from "@/types";
import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";

const EditContentModal = ({
  content,
  modalOpen,
  setModalOpen,
}: {
  content: Content;
  modalOpen: boolean;
  setModalOpen: (value: boolean) => void;
}) => {
  const [newTitle, setNewTitle] = useState(content.title);
  const [newDescription, setNewDescription] = useState(content.description);
  const [newPrice, setNewPrice] = useState(content.price);
  const [updating, setUpdating] = useState(false);

  const updateContent = async () => {
    setUpdating(true);
    toast.loading("Updating content...");
    await updateDocument("uploads", content.id, {
      title: newTitle,
      description: newDescription,
      price: newPrice,
    });
    setUpdating(false);
    toast.dismiss();
    toast.success("Content updated successfully");
    window.location.reload();
    setModalOpen(false);
  };

  return (
    <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
      <Modal.Header>{newTitle}</Modal.Header>
      <Modal.Body>
        <div className="my-2 flex flex-col space-y-1">
          <label htmlFor="title">Title</label>
          <input
            className="rounded border border-gray-200 p-2"
            type="text"
            id="title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </div>
        <div className="my-2 flex flex-col space-y-1">
          <label htmlFor="description">Description</label>
          <textarea
            className="rounded border border-gray-200 p-2"
            rows={4}
            id="description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </div>
        <div className="my-2 flex flex-col space-y-1">
          <label htmlFor="price">Price</label>
          <input
            className="rounded border border-gray-200 p-2"
            type="number"
            id="price"
            value={newPrice}
            onChange={(e) => setNewPrice(Number(e.target.value))}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="w-full flex justify-between items-center">
          <Button color="gray" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button disabled={updating} color="blue" onClick={async () => await updateContent()}>
            {updating ? "Updating..." : "Update"}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EditContentModal;
