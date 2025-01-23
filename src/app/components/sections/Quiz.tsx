"use client";

import { auth, db } from "@/lib/firebase/config";
import { doc } from "firebase/firestore";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { MdAdd } from "react-icons/md";
import CreateQuizModal from "../modals/CreateQuizModal";
import toast from "react-hot-toast";
import { maxExamAIQuestions } from "@/utils/maxExamAIQuestions";
import { truncateText } from "@/utils/truncateText";
import IDontAgree from "./IDontAgree";
import BuyTokens from "../modals/BuyTokens";
import { QuizQuestion } from "@/types";

const Quiz = () => {
  const [buyTokensModalOpen, setBuyTokensModalOpen] = useState(false);
  const [showDisagree, setShowDisagree] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    reason: string;
  } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [createQuizModalOpen, setCreateQuizModalOpen] =
    useState<boolean>(false);
  const [creatingQuiz, setCreatingQuiz] = useState<boolean>(false);
  const [user] = useAuthState(auth);
  const [quiz, loading, error] = useDocumentData(
    user ? doc(db, `quizes/${user.uid}`) : null
  );
  const [firebaseUser, fetchingFirebaseUser] = useDocumentData(
    user ? doc(db, `users/${user.uid}`) : null
  );

  const handleAnswerSelect = (selectedOption: string): void => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = selectedOption;
    setUserAnswers(newAnswers);
  };

  const calculateScore = (): number => {
    if (!quiz) return 0;
    return userAnswers.reduce((score, answer, index) => {
      return answer === quiz.questions[index].answer ? score + 1 : score;
    }, 0);
  };

  const nextQuestion = (): void => {
    if (!quiz) return;
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = (): void => {
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  const createQuiz = async (
    title: string,
    topic: string,
    numberOfQuestions: number
  ): Promise<void> => {
    if (!user) {
      toast.error("You need to be logged in to create a quiz");
      return;
    }
    if (fetchingFirebaseUser || !firebaseUser) {
      toast.error("Please try again...");
      return;
    }
    if (!title.trim() || !topic.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (numberOfQuestions < 3) {
      toast.error("Number of questions must be at least 3");
      return;
    }
    if (
      quiz &&
      numberOfQuestions > maxExamAIQuestions(false, firebaseUser.ai_tokens)
    ) {
      toast.error(
        `You can only create ${maxExamAIQuestions(
          false,
          firebaseUser.ai_tokens
        )} questions`
      );
      return;
    }
    if (!quiz && numberOfQuestions > 5) {
      toast.error("You can only create 5 or less questions for first test");
      return;
    }
    setCreatingQuiz(true);
    toast.loading("Creating quiz...");
    try {
      const userFirebaseToken = await user.getIdToken();
      const response = await fetch("/api/quizes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userFirebaseToken}`,
        },
        body: JSON.stringify({ title, topic, numberOfQuestions }),
      });
      setCreatingQuiz(false);
      toast.dismiss();
      window.location.reload();
      if (!response.ok) throw new Error();
      toast.success("Quiz created successfully");
    } catch {
      toast.dismiss();
      toast.error("Failed to create quiz");
    }
  };

  if (loading || fetchingFirebaseUser)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-200"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 p-4">
        Error...Please contact support(Ali):0768947958
      </div>
    );

  if (firebaseUser && firebaseUser.ai_tokens === undefined) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        {createQuizModalOpen && (
          <CreateQuizModal
            openModal={createQuizModalOpen}
            setOpenModal={setCreateQuizModalOpen}
            maxQuestions={maxExamAIQuestions(true)}
            onSubmit={createQuiz}
            submitting={creatingQuiz}
          />
        )}
        <button
          onClick={() => setCreateQuizModalOpen(true)}
          className="flex items-center gap-2 bg-accent-200 hover:bg-accent-300 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-md"
        >
          <MdAdd className="text-xl" /> Create Your First Quiz
        </button>
      </div>
    );
  }

  const triggerBuyTokens = () => {
    setCreateQuizModalOpen(false);
    setBuyTokensModalOpen(true);
  };

  if (quiz)
    return (
      <div className="max-w-3xl mx-auto">
        {buyTokensModalOpen && user && (
          <BuyTokens
            openModal={buyTokensModalOpen}
            setOpenModal={setBuyTokensModalOpen}
            user={user}
          />
        )}
        {createQuizModalOpen && firebaseUser?.ai_tokens !== undefined && (
          <CreateQuizModal
            openModal={createQuizModalOpen}
            setOpenModal={setCreateQuizModalOpen}
            maxQuestions={maxExamAIQuestions(false, firebaseUser.ai_tokens)}
            onSubmit={createQuiz}
            submitting={creatingQuiz}
            firebaseTokens={firebaseUser.ai_tokens}
            triggerBuyTokens={triggerBuyTokens}
          />
        )}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-end mb-2 items-center gap-2">
            <p className="text-sm font-semibold text-accent-200 text-nowrap">
              {firebaseUser?.ai_tokens} AI tokens
            </p>
            <button
              onClick={() => setBuyTokensModalOpen(true)}
              className="text-sm underline underline-offset-1 text-blue-500 text-nowrap"
            >
              Add More
            </button>
          </div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 text-center">
            {truncateText(quiz.title, 25)}
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            {truncateText(quiz.topic, 50)}
          </p>

          {!showResults ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-3 md:p-6 rounded-lg">
                <div className="mb-3 md:mb-4 text-sm text-gray-500">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </div>
                <h2 className="md:text-xl text-lg font-medium mb-4 md:mb-6">
                  {quiz.questions[currentQuestion].question}
                </h2>

                <div className="space-y-3">
                  {/* Sort options alphabetically by key (A, B, C, D) */}
                  {Object.entries(quiz.questions[currentQuestion].options)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => handleAnswerSelect(key)}
                        className={`w-full text-left p-4 rounded-lg transition-all ${
                          userAnswers[currentQuestion] === key
                            ? "bg-accent-200 text-white"
                            : "bg-white hover:bg-gray-100"
                        } border border-gray-200`}
                      >
                        <span className="font-medium">{key}:</span>{" "}
                        {value as string}
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={nextQuestion}
                  disabled={userAnswers[currentQuestion] === undefined}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    userAnswers[currentQuestion] === undefined
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-accent-200 text-white hover:bg-accent-300"
                  }`}
                >
                  {currentQuestion === quiz.questions.length - 1
                    ? "Finish Quiz"
                    : "Next Question"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Quiz Results</h2>
                <div className="text-6xl font-bold text-accent-200 mb-4">
                  {calculateScore()}/{quiz.questions.length}
                </div>
                <p className="text-gray-600">
                  {((calculateScore() / quiz.questions.length) * 100).toFixed(
                    0
                  )}
                  % Correct
                </p>
              </div>

              <div className="space-y-4">
                {quiz.questions.map((question: QuizQuestion, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      userAnswers[index] === question.answer
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p className="font-medium mb-2">{question.question}</p>
                    <div className="text-sm">
                      <p>Your answer: {question.options[userAnswers[index]]}</p>
                      {userAnswers[index] !== question.answer && (
                        <>
                          <span className="block text-green-600 mt-1">
                            Correct answer: {question.options[question.answer]}
                          </span>
                          <p
                            onClick={() => {
                              setSelectedQuestion({
                                question: question.question,
                                userAnswer:
                                  question.options[userAnswers[index]],
                                correctAnswer:
                                  question.options[question.answer],
                                reason: question.reason,
                              });
                              setShowDisagree(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer mt-2 underline text-sm underline-offset-2"
                          >
                            I don't agree / Understand
                          </p>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {question.reason}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center items-center flex-wrap gap-4">
                <button
                  onClick={() => setCreateQuizModalOpen(true)}
                  className="px-6 py-3 bg-accent-200 text-white rounded-lg hover:bg-accent-300 transition-all"
                >
                  Generate Another Quiz
                </button>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
        {showDisagree && selectedQuestion && user && firebaseUser && (
          <IDontAgree
            ai_tokens={firebaseUser.ai_tokens}
            setBuyTokensModalOpen={setBuyTokensModalOpen}
            question={selectedQuestion}
            user={user}
            onClose={() => {
              setShowDisagree(false);
              setSelectedQuestion(null);
            }}
          />
        )}
      </div>
    );
};

export default Quiz;
