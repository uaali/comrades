import HomeBanner from "./components/sections/HomeBanner";
import HomePage from "./components/sections/HomePage";

export default function Home() {
  return (
    <div className="p-4 md:px-6">
      <HomeBanner />
      <HomePage />
    </div>
  );
}
