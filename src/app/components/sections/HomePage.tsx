"use client";

import ExploreNavbar from "@/components/ExploreNavbar";
import { useState } from "react";
import HomeBanner from "./HomeBanner";
import UploadBanner from "./UploadBanner";

const HomePage = () => {
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
    </div>
  );
};

export default HomePage;
