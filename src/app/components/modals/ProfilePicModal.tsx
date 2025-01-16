import { Modal } from "flowbite-react";
import Image from "next/image";

const ProfilePicModal = ({
  openModal,
  setOpenModal,
  selectedImage,
  setSelectedImage,
}: {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  selectedImage: string;
  setSelectedImage: (value: string) => void;
}) => {
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)} size="md">
      <Modal.Header>Select the profile picture</Modal.Header>
      <Modal.Body>
        <div className="p-4 grid grid-cols-2 gap-4 w-full place-items-center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Image
              key={i}
              src={`/profile_icons/${i}.svg`}
              alt={`Profile pic ${i}`}
              width={48}
              height={48}
              className={`${
                parseInt(selectedImage) === i
                  ? "border-2"
                  : "border"
              } rounded-full border-primary-200  border cursor-pointer`}
              onClick={() => {
                setSelectedImage(i.toString());
                setOpenModal(false);
              }}
            />
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProfilePicModal;
