import QuizesContainer from "@/app/components/sections/QuizesContainer";

const ExamAi = () => {
  return (
    <div className="p-4 md:px-6 font-inter">
      <p className="font-xl font-poppins font-bold md:text-2xl tracking-wider">
        Exam AI
      </p>
      <p className="text-sm my-2">
        "An AI to test your knowledge in a given topic. Utilize it to prepare for
        exams and when you want to study in a fun easy way."
      </p>
      <hr />
      <div className="my-4">
        <QuizesContainer />
      </div>
    </div>
  );
};

export default ExamAi;
