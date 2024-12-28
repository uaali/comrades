"use client";

import ExploreNavbar from "@/components/ExploreNavbar";
import { useState } from "react";
import HomeBanner from "./HomeBanner";
import UploadBanner from "./UploadBanner";
import { Content } from "@/types";
import ContentContainer from "./ContentContainer";


const HomePage = ({ content }: { content: Content[] }) => {
  const [currentCategory, setCurrentCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("");
  
  return (
    <div>
      <div className="flex gap-4 justify-between">
        <div className="md:flex hidden md:border-r-[1.5px] md:pr-8">
          <HomeBanner />
        </div>
        <ExploreNavbar
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          currentCategory={currentCategory}
          setCurrentCategory={setCurrentCategory}
        />
        <div className="hidden lg:flex lg:w-full lg:justify-end">
          <UploadBanner />
        </div>
      </div>
      <div className="my-2 md:my-6 border-b-[1.5px] border-gray-200"></div>
      <ContentContainer 
        content={content} 
        selectedCourse={selectedCourse}
        currentCategory={currentCategory}
      />
    </div>
  );
};

export default HomePage;