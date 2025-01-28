import { auth, db } from "@/lib/firebase/config";
import { Favourite } from "@/types";
import { collection } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionOnce } from "react-firebase-hooks/firestore";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

const FavoriteItem = ({ favourite }: { favourite: Favourite }) => (
  <Link
    href={`/profile/${favourite.id}`}
    className="flex flex-col items-center justify-center min-w-[80px] px-2 hover:opacity-80 transition-opacity"
  >
    <div className="relative">
      <Image
        src={`/profile_icons/${favourite.image}.svg`}
        alt={`Profile pic ${favourite.name}`}
        width={48}
        height={48}
        className="rounded-full border-2 border-primary-200 w-12 h-12"
      />
    </div>
    <p className="text-sm mt-1 text-center truncate w-full">{favourite.name}</p>
  </Link>
);

const LoadingState = () => (
  <div className="flex gap-4 px-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex flex-col items-center animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="w-16 h-3 mt-2 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="text-red-500 px-4 py-2 text-sm">{message}</div>
);

const Favourites = () => {
  const [user] = useAuthState(auth);
  const [favourites, setFavourites] = useState<Favourite[] | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showControls, setShowControls] = useState(false);

  const [snapshot, loading, error] = useCollectionOnce(
    user ? collection(db, `users/${user.uid}/favourites`) : null
  );

  useEffect(() => {
    if (snapshot) {
      const fetchedFavourites = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Favourite[];
      setFavourites(fetchedFavourites);
    }
  }, [snapshot]);

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("favorites-container");
    if (container) {
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setScrollPosition(container.scrollLeft + scrollAmount);
    }
  };

  useEffect(() => {
    const container = document.getElementById("favorites-container");
    if (container) {
      const handleScrollCheck = () => {
        setShowControls(container.scrollWidth > container.clientWidth);
        setScrollPosition(container.scrollLeft);
      };

      handleScrollCheck();
      container.addEventListener("scroll", handleScrollCheck);
      window.addEventListener("resize", handleScrollCheck);

      return () => {
        container.removeEventListener("scroll", handleScrollCheck);
        window.removeEventListener("resize", handleScrollCheck);
      };
    }
  }, [favourites]);

  if (!user) return null;
  if (error) {
    console.error(error);
    return <ErrorState message="Failed to load favorites" />;
  }
  if (loading)
    return (
      <div>
        <LoadingState />
        <div className="my-2 md:my-6 border-b-[1.5px] border-gray-200" />
      </div>
    );
  if (!favourites?.length) return null;

  return (
    <div className="relative group">
      <div
        id="favorites-container"
        className="flex overflow-x-auto scrollbar-hide scroll-smooth gap-2 px-4"
      >
        {favourites.map((favourite) => (
          <FavoriteItem key={favourite.id} favourite={favourite} />
        ))}
      </div>

      {showControls && (
        <>
          <button
            onClick={() => handleScroll("left")}
            className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0
              ${scrollPosition <= 0 ? "disabled:hidden" : ""}`}
            disabled={scrollPosition <= 0}
          >
            <MdChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleScroll("right")}
            className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0
              ${
                scrollPosition >=
                (document.getElementById("favorites-container")?.scrollWidth ||
                  0) -
                  (document.getElementById("favorites-container")
                    ?.clientWidth || 0)
                  ? "disabled:hidden"
                  : ""
              }`}
            disabled={
              scrollPosition >=
              (document.getElementById("favorites-container")?.scrollWidth ||
                0) -
                (document.getElementById("favorites-container")?.clientWidth ||
                  0)
            }
          >
            <MdChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div className="my-2 md:my-6 border-b-[1.5px] border-gray-200" />
    </div>
  );
};

export default Favourites;
