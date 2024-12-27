interface ExploreNavbarProps {
  currentCategory: string;
  setCurrentCategory: (category: string) => void;
}
const ExploreNavbar = ({
  currentCategory,
  setCurrentCategory,
}: ExploreNavbarProps) => {
  return <div className="flex gap-2 md:gap-4 font-inter"></div>;
};

export default ExploreNavbar;
