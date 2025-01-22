import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import { MdToken } from "react-icons/md";
import { RiGeminiFill } from "react-icons/ri";

const CreateQuizModal = ({
  openModal,
  setOpenModal,
  maxQuestions,
  onSubmit,
  submitting,
  firebaseTokens,
  triggerBuyTokens,
}: {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  maxQuestions: number;
  onSubmit: (title: string, topic: string, numberOfQuestions: number) => void;
  submitting: boolean;
  triggerBuyTokens?: () => void;
  firebaseTokens?: number;
}) => {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(maxQuestions);

  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <Modal.Header>Enter quiz details</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-bold text-sm tracking-wide">Quiz Title</p>
            <input
              type="text"
              placeholder="Enter title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              className="rounded w-full"
            />
          </div>
          <div className="space-y-2">
            <p className="font-bold text-sm tracking-wide">Topic</p>
            <textarea
              onChange={(e) => setTopic(e.target.value)}
              value={topic}
              placeholder="Enter topic description"
              className="rounded w-full"
            />
          </div>
          <div className="space-y-2">
            <p className="font-bold text-sm tracking-wide">
              Number of questions
            </p>
            <input
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              type="number"
              className="rounded"
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-between items-center w-full">
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>
          {firebaseTokens !== undefined && firebaseTokens < 900 && triggerBuyTokens ? (
            <button
              onClick={triggerBuyTokens}
              className="bg-accent-200 text-white px-3 py-2 rounded flex gap-2 items-center"
            >
              <MdToken className="w-5 h-5" />
              <p>Buy Tokens</p>
            </button>
          ) : (
            <button
              className={`${
                submitting ? "bg-accent-300" : "bg-accent-200"
              }  text-white px-3 py-2 rounded flex gap-2 items-center`}
              disabled={submitting}
              onClick={() => onSubmit(title, topic, numberOfQuestions)}
            >
              <RiGeminiFill className="w-5 h-5" />
              <p>{submitting ? "Generating..." : "Generate"}</p>
            </button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateQuizModal;
