"use client";

import ExploreNavbar from "@/components/ExploreNavbar";
import { useState } from "react";
import HomeBanner from "./HomeBanner";

const HomePage = () => {
  const [currentCategory, setCurrentCategory] = useState("all");
  return (
    <div>
      <div className="md:flex hidden">
        <HomeBanner />
      </div>
      <ExploreNavbar
        currentCategory={currentCategory}
        setCurrentCategory={setCurrentCategory}
      />
    </div>
  );
};

export default HomePage;
