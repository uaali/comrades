"use client";
import { useState } from "react";
import { MdAdd } from "react-icons/md";
import CreateQuizModal from "../modals/CreateQuizModal";
import toast from "react-hot-toast";

const calculateMaxQuestions = (tokens: number) => {
  const maxQuestions = Number((tokens / 150).toFixed(0));
  if (maxQuestions < 100) return maxQuestions;
  return 100;
};

const QuizesContainer = () => {
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const quiz = {
    title: "",
    topic: "",
    questions: [],
    tokens: 1000000,
    freeTrialUsed: false,
  };

  const onCreateQuiz = (
    title: string,
    topic: string,
    numberOfQuestions: number
  ) => {
    setSubmitting(true);
    toast.loading("Creating quiz...");
    if (!title.trim() || !topic.trim() || numberOfQuestions < 1) {
      toast.dismiss();
      toast.error("Please fill all fields");
      setSubmitting(false);
      return;
    }
    if (numberOfQuestions > calculateMaxQuestions(quiz.tokens)) {
      toast.dismiss();
      toast.error(
        `Number of questions should be less or equal to ${
          !quiz.freeTrialUsed ? 10 : calculateMaxQuestions(quiz.tokens)
        }`
      );
      setSubmitting(false);
      return;
    }
    setTimeout(() => {
      toast.dismiss();
      toast.success("Quiz created successfully");
      setSubmitting(false);
      setShowCreateQuizModal(false);
    }, 5000);
  };
  return (
    <div>
      {showCreateQuizModal && (
        <CreateQuizModal
          submitting={submitting}
          openModal={showCreateQuizModal}
          setOpenModal={setShowCreateQuizModal}
          maxQuestions={
            !quiz.freeTrialUsed ? 10 : calculateMaxQuestions(quiz.tokens)
          }
          onSubmit={onCreateQuiz}
        />
      )}
      <p className="text-right">{quiz.tokens} tokens</p>
      <div className="flex justify-center w-full my-2">
        <button className="bg-primary-200 px-3 hover:bg-primary-300 text-white rounded text-lg py-2 flex gap-1 items-center">
          <MdAdd className="w-5 h-5" />
          <p onClick={() => setShowCreateQuizModal(true)}>Create Quiz</p>
        </button>
      </div>
    </div>
  );
};

export default QuizesContainer;
