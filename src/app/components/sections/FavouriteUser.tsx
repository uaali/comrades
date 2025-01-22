"use client";

import { auth, db } from "@/lib/firebase/config";
import { doc, collection, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { MdCheck, MdPerson, MdSwapHoriz } from "react-icons/md";
import ProfilePicModal from "../modals/ProfilePicModal";
import { toast } from "react-hot-toast";
import LoadingUser from "../ui/LoadingUser";

// Loading component with skeleton animation

export default function FavoriteUser({ publisherId }: { publisherId: string }) {
  const [state, setState] = useState({
    selectedImage: "1",
    favoriteName: "",
    favorited: null as boolean | null,
    profilePicModalOpen: false,
    saving: false,
    favoriteId: null as string | null,
    error: null as string | null,
  });

  const [user, userLoading] = useAuthState(auth);

  useEffect(() => {
    if (!user || userLoading) return;

    const fetchFavorite = async () => {
      try {
        const favouriteRef = doc(
          db,
          `users/${user.uid}/favourites`,
          publisherId
        );
        const favouriteDoc = await getDoc(favouriteRef);
        if (favouriteDoc.exists()) {
          const favoriteData = favouriteDoc.data();
          setState((prev) => ({
            ...prev,
            selectedImage: favoriteData.image,
            favoriteName: favoriteData.name,
            favorited: true,
            favoriteId: favouriteDoc.id,
          }));
        } else {
          setState((prev) => ({ ...prev, favorited: false }));
        }
      } catch (error) {
        console.error("Error fetching favorite:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to load favorite status",
        }));
      }
    };

    fetchFavorite();
  }, [user, userLoading, publisherId]);

  const handleSave = async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, saving: true }));

    if (state.favoriteName.trim() === "") {
      toast.error("Please enter a name");
      setState((prev) => ({ ...prev, saving: false }));
      return;
    }

    if (state.favoriteName.length > 10) {
      toast.error("Name must be 10 characters or less");
      setState((prev) => ({ ...prev, saving: false }));
      return;
    }

    try {
      const favouritesRef = collection(db, `users/${user.uid}/favourites`);
      const newFavoriteRef = doc(favouritesRef, publisherId);

      await setDoc(newFavoriteRef, {
        name: state.favoriteName,
        image: state.selectedImage,
      });

      toast.success("Added to favourites!");
      setState((prev) => ({
        ...prev,
        favorited: true,
        favoriteId: newFavoriteRef.id,
        saving: false,
      }));
    } catch (error) {
      toast.error("Failed to save to favourites");
      setState((prev) => ({
        ...prev,
        saving: false,
        error: "Failed to save favorite",
      }));
    }
  };

  const handleRemove = async () => {
    if (!user || !state.favoriteId) return;

    setState((prev) => ({ ...prev, saving: true }));
    try {
      await deleteDoc(
        doc(db, `users/${user.uid}/favourites/${state.favoriteId}`)
      );
      toast.success("Removed from favourites");
      setState((prev) => ({
        ...prev,
        favorited: false,
        favoriteId: null,
        favoriteName: "",
        saving: false,
      }));
    } catch (error) {
      toast.error("Failed to remove from favourites");
      setState((prev) => ({
        ...prev,
        saving: false,
        error: "Failed to remove favorite",
      }));
    }
  };

  if (!user) return null;
  if (userLoading || state.favorited === null) return <LoadingUser />;
  if (state.error) {
    return <div className="text-red-500">{state.error}</div>;
  }

  return (
    <div className="my-2">
      {state.profilePicModalOpen && state.selectedImage && (
        <ProfilePicModal
          openModal={state.profilePicModalOpen}
          setOpenModal={(open) =>
            setState((prev) => ({ ...prev, profilePicModalOpen: open }))
          }
          selectedImage={state.selectedImage}
          setSelectedImage={(image) =>
            setState((prev) => ({ ...prev, selectedImage: image }))
          }
        />
      )}

      {!state.favorited && (
        <h2 className="font-bold font-poppins mb-4">Add to favourites</h2>
      )}

      {state.favorited ? (
        <div className="flex justify-center md:justify-start">
          <div className="flex flex-col items-center justify-center">
            <Image
              height={48}
              width={48}
              alt="profile picture"
              className="rounded-full w-12 h-12 border border-primary-200"
              src={`/profile_icons/${state.selectedImage}.svg`}
            />
            <p className="font-medium">{state.favoriteName}</p>
            <button
              onClick={handleRemove}
              disabled={state.saving}
              className="text-red-500 text-sm w-min hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {state.saving ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between md:justify-start gap-4 md:gap-8 flex-wrap font-inter">
          <input
            type="text"
            className="rounded-lg border w-full md:w-1/4 p-2 focus:outline-none focus:ring-2 focus:ring-accent-200"
            placeholder="Enter a name (max 10 chars)"
            value={state.favoriteName}
            onChange={(e) =>
              setState((prev) => ({ ...prev, favoriteName: e.target.value }))
            }
            maxLength={10}
          />

          <div className="flex flex-col items-center gap-2">
            {state.selectedImage ? (
              <>
                <Image
                  alt="profile picture"
                  height={48}
                  width={48}
                  className="rounded-full w-12 h-12 border border-primary-200"
                  src={`/profile_icons/${state.selectedImage}.svg`}
                />
                <button
                  onClick={() =>
                    setState((prev) => ({ ...prev, profilePicModalOpen: true }))
                  }
                  className="flex items-center gap-2 text-white bg-gray-500 hover:bg-gray-600 py-1 px-3 text-sm font-bold tracking-wide rounded-lg transition-colors"
                >
                  <MdSwapHoriz />
                  <span>Change</span>
                </button>
              </>
            ) : (
              <MdPerson className="text-4xl text-gray-500" />
            )}
          </div>

          <button
            disabled={state.saving}
            onClick={handleSave}
            className="flex items-center text-white gap-2 bg-accent-200 hover:bg-accent-300 disabled:bg-accent-300 disabled:cursor-not-allowed py-2 px-4 font-bold tracking-wide rounded-lg transition-colors"
          >
            <MdCheck className="w-5 h-5" />
            <span>{state.saving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
