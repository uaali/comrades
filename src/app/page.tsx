import HomeBanner from "./components/sections/HomeBanner";
import HomePage from "./components/sections/HomePage";

export default function Home() {
  return (
    <div className="p-4 md:px-6">
      <div className="flex md:hidden">
        <HomeBanner />
      </div>
      <HomePage />
    </div>
  );
}
