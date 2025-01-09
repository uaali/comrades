"use client";

import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { MdCheck, MdPerson, MdSwapHoriz } from "react-icons/md";
import ProfilePicModal from "../modals/ProfilePicModal";
import toast from "react-hot-toast";

export default function FavouriteUser({
  publisherId,
}: {
  publisherId: string;
}) {
  const [selectedImage, setSelectedImage] = useState<null | string>();
  const [favouriteName, setFavouriteName] = useState<string>("");
  const [favourited, setFavourited] = useState<boolean | null>();
  const [profilePicModalOpen, setProfilePicModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [favouriteId, setFavouriteId] = useState<string | null>(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const fetchFavourite = async () => {
      // Query the favourites subcollection for this publisher
      const favouritesRef = collection(db, `users/${user.uid}/favourites`);
      const q = query(favouritesRef, where("id", "==", publisherId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const favouriteDoc = querySnapshot.docs[0];
        const favouriteData = favouriteDoc.data();
        setSelectedImage(favouriteData.image);
        setFavouriteName(favouriteData.name);
        setFavourited(true);
        setFavouriteId(favouriteDoc.id);
      } else {
        setFavourited(false);
        setSelectedImage("1");
      }
    };

    fetchFavourite();
  }, [user, publisherId]);

  const saveFavourite = async () => {
    if (!user) return;
    
    setSaving(true);
    
    if (favouriteName === "") {
      toast.error("Please give me a name you like");
      setSaving(false);
      return;
    }

    try {
      // Create a new document in the favourites subcollection
      const favouritesRef = collection(db, `users/${user.uid}/favourites`);
      const newFavouriteRef = doc(favouritesRef); // Let Firestore generate the ID

      await setDoc(newFavouriteRef, {
        id: publisherId,
        name: favouriteName,
        image: selectedImage,
      });

      toast.success("Favourite saved successfully!");
      setFavourited(true);
      setFavouriteId(newFavouriteRef.id);
    } catch (error) {
      toast.error("Failed to save favourite");
      console.error("Error saving favourite:", error);
    }

    setSaving(false);
  };

  const removeFavourite = async () => {
    if (!user || !favouriteId) return;

    setSaving(true);
    try {
      await deleteDoc(doc(db, `users/${user.uid}/favourites/${favouriteId}`));
      toast.success("Favourite removed successfully!");
      setFavourited(false);
      setFavouriteId(null);
      setFavouriteName("");
    } catch (error) {
      toast.error("Failed to remove favourite");
      console.error("Error removing favourite:", error);
    }
    setSaving(false);
  };

  return (
    <div className="my-2">
      {profilePicModalOpen && selectedImage && (
        <ProfilePicModal
          openModal={profilePicModalOpen}
          setOpenModal={setProfilePicModalOpen}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
      )}
      {user && (
        <>
          <p className="font-bold font-poppins">
            {favourited ? "Your favourite" : "Add to favourite"}
          </p>
          {favourited === null ? (
            <p>Loading ...</p>
          ) : (
            <>
              {favourited ? (
                <div className="">
                  <Image
                    height={48}
                    width={48}
                    alt="profile-pic"
                    className="rounded-full w-12 h-12 border border-primary-200"
                    src={`/profile_icons/${selectedImage}.svg`}
                  />
                  <p>{favouriteName}</p>
                  <button
                    onClick={removeFavourite}
                    disabled={saving}
                    className="text-red-500 text-sm mt-2"
                  >
                    {saving ? "Removing..." : "Remove from favourites"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between md:justify-start gap-4 md:gap-8 flex-wrap font-inter">
                  <input
                    type="text"
                    className="rounded-lg border w-full placeholder:text-sm md:w-1/4"
                    placeholder="Give me a name you like"
                    value={favouriteName}
                    onChange={(e) => setFavouriteName(e.target.value)}
                  />
                  <div className="">
                    {selectedImage ? (
                      <div className="flex items-center justify-center gap-2 flex-col">
                        <Image
                          alt="profile-pic"
                          height={48}
                          width={48}
                          className="rounded-full w-12 h-12 border border-primary-200"
                          src={`/profile_icons/${selectedImage}.svg`}
                        />
                        <button
                          onClick={() => setProfilePicModalOpen(true)}
                          className="flex items-center gap-2 text-white bg-gray-500 py-1 text-sm font-bold tracking-wide px-2 rounded-lg"
                        >
                          <MdSwapHoriz />
                          <p>Change</p>
                        </button>
                      </div>
                    ) : (
                      <MdPerson className="text-4xl text-gray-500" />
                    )}
                  </div>
                  <button
                    disabled={saving}
                    onClick={saveFavourite}
                    className={`flex items-center text-white gap-2 ${
                      saving
                        ? "bg-accent-300 hover:cursor-not-allowed"
                        : "bg-accent-200"
                    } py-1 font-bold tracking-wide px-2 rounded-lg`}
                  >
                    <MdCheck className="w-5 h-5" />
                    <p>{saving ? "Saving ..." : "Save"}</p>
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}