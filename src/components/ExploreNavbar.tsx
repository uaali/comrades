import CourseSelection from "@/app/components/ui/CourseSelection";
import { db } from "@/lib/firebase/config";
import { collection } from "firebase/firestore";
import { useEffect } from "react";
import { useCollection } from "react-firebase-hooks/firestore";

interface ExploreNavbarProps {
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
}

const ExploreNavbar = ({
  currentCategory,
  setCurrentCategory,
  selectedCourse,
  setSelectedCourse,
}: ExploreNavbarProps) => {
  const coursesQuery = collection(db, "courses");
  const [courses, loading] = useCollection(coursesQuery);
  return (
    <div className="w-full md:min-w-80 font-inter my-4 md:my-0 space-y-3">
      <div className="flex gap-6 self-start items-center">
        <p
          onClick={() => setCurrentCategory("all")}
          className={`${
            currentCategory == "all" ? "text-primary-200" : "text-[#86858E]"
          } text-sm font-semibold tracking-wide hover:cursor-pointer`}
        >
          All
        </p>
        <p
          onClick={() => setCurrentCategory("notes")}
          className={`${
            currentCategory == "notes" ? "text-primary-200" : "text-[#86858E]"
          } text-sm font-semibold tracking-wide hover:cursor-pointer`}
        >
          Notes
        </p>
        <p
          onClick={() => setCurrentCategory("past-papers")}
          className={`${
            currentCategory == "past-papers"
              ? "text-primary-200"
              : "text-[#86858E]"
          } text-sm font-semibold tracking-wide hover:cursor-pointer`}
        >
          Past Papers
        </p>
        <p
          onClick={() => setCurrentCategory("study-guides")}
          className={`${
            currentCategory == "study-guides"
              ? "text-primary-200"
              : "text-[#86858E]"
          } text-sm font-semibold tracking-wide hover:cursor-pointer`}
        >
          Study Guides
        </p>
      </div>
      {courses && !loading ? (
        <CourseSelection
          placeholder="Search Course"
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          courses={courses.docs.map((course) => course.data().name)}
        />
      ) : (
        <div className="p-3 bg-gray-200 rounded-lg animate-pulse"></div>
      )}
    </div>
  );
};

export default ExploreNavbar;
