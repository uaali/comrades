import { useState } from "react";
import { MdClose } from "react-icons/md";

interface CourseSelectionProps {
  selectedCourse: string;
  setSelectedCourse?: (course: string) => void;
  setSearchValue2?: (searchValue: string) => void;
  placeholder: string;
  courses: string[];
  setCourseExisted?: (courseExisted: boolean) => void;
}
const CourseSelection = ({
  selectedCourse,
  setSelectedCourse,
  setSearchValue2,
  setCourseExisted,
  placeholder,
  courses,
}: CourseSelectionProps) => {
  const [searchValue, setSearchValue] = useState(selectedCourse);
  const [typingCourse, setTypingCourse] = useState(false);

  const handleClearSelection = () => {
    setSearchValue("");
    if (setSelectedCourse) {
      setSelectedCourse("");
    }
    if (setSearchValue2) {
      setSearchValue2("");
    }
    if (setCourseExisted) {
      setCourseExisted(false);
    }
  };

  const handleCourseSelect = (course: string) => {
    setSearchValue(course);
    if (setSelectedCourse) {
      setSelectedCourse(course);
    }
    if (setSearchValue2) {
      setSearchValue2(course);
    }
    if (setCourseExisted) {
      setCourseExisted(true);
    }
    setTypingCourse(false);
  };
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setSearchValue2 && setSearchValue2(e.target.value);
            setCourseExisted && setCourseExisted(false);
            setTypingCourse(true);
          }}
          placeholder={placeholder}
          className="w-full p-2 border rounded-md pr-8 focus:outline-none focus:ring-1 focus:ring-primary-200"
        />
        {searchValue && (
          <button
            onClick={handleClearSelection}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <MdClose size={16} />
          </button>
        )}
      </div>

      {/* Course suggestions */}
      <div
        className={`${
          !typingCourse ? "hidden md:block" : "h-24"
        } mt-2 md:h-28 overflow-y-auto border rounded-md`}
      >
        {courses
          .filter((course) =>
            course.toLowerCase().includes(searchValue.toLowerCase())
          )
          .map((course, index) => (
            <div
              key={index}
              onClick={() => handleCourseSelect(course)}
              className={`p-2 hover:bg-primary-100 hover:text-white cursor-pointer ${
                selectedCourse === course ? "bg-primary-200 text-white" : ""
              }`}
            >
              {course}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CourseSelection;
