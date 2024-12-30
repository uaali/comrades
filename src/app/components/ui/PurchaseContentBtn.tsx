"use client";

import { auth, db, provider, storage } from "@/lib/firebase/config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";

const PurchaseContentBtn = ({ contentId }: { contentId: string }) => {
  const [purchasing, setPurchasing] = useState(false);
  const [checkoutLink, setCheckoutLink] = useState<string | null>(null);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [user] = useAuthState(auth);
  const router = useRouter();

  const checkHasPurchased: () => Promise<boolean> = async () => {
    try {
      if (!user?.uid) return false;
      const purchaseRef = doc(db, `uploads/${contentId}/purchases/${user.uid}`);
      const purchaseSnap = await getDoc(purchaseRef);
      if (purchaseSnap.exists()) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking purchase status:", error);
      toast.error("Error checking purchase status");
      return false;
    }
  };

  useEffect(() => {
    const check = async () => {
      const checkPurchase = await checkHasPurchased();
      //fetch content
      if (checkPurchase) {
        const fetchDownloadUrl = async () => {
          try {
            const fileRef = ref(storage, `uploads/${contentId}/file`);
            const url = await getDownloadURL(fileRef);
            setDownloadURL(url);
          } catch (error) {
            console.error("Error fetching download URL:", error);
          }
        };
        fetchDownloadUrl();
      }
    }
    check();
  }, [user]);

  const handleDownload = () => {
    if (downloadURL) {
      const link = document.createElement("a");
      link.href = downloadURL;
      link.download = downloadURL.split("/").pop() ?? "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.log("Download URL not available");
    }
  };

  const getCheckoutLink = async () => {
    if (!user) {
      toast.error("You must be logged in to purchase content");
      await signInWithPopup(auth, provider);
    }
    setPurchasing(true);
    try {
      toast.loading("Redirecting you in a few...");
      const response = await fetch("/api/intasend/purchase/get-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentId, userId: user?.uid }),
      });
      const data = await response.json();
      if (data.errors || data.error) {
        throw new Error(data.errors || data.error);
      }
      setCheckoutLink(data.checkoutLink);
      router.push(data.checkoutLink);
    } catch (error) {
      toast.error("Error purchasing content");
    }
    toast.dismiss();
    setPurchasing(false);
  };

  return (
    <div>
      {checkoutLink ? (
        <Link
          href={checkoutLink}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-accent-200 hover:underline"
        >
          Click here if not redirected
        </Link>
      ) : (
        <>
          {!downloadURL ? (
            <button
              disabled={purchasing}
              onClick={getCheckoutLink}
              className={` py-3 px-8 rounded font-bold tracking-wide${
                purchasing
                  ? "cursor-wait bg-accent-300 text-gray-400"
                  : " text-white shadow shadow-gray-600 hover:shadow-xl hover:shadow-gray-600 transition-shadow duration-200 bg-accent-200 hover:bg-accent-300"
              }`}
            >
              {purchasing ? "Purchasing..." : "Purchase"}
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="py-3 px-8 rounded font-bold tracking-wide text-white shadow shadow-gray-600 hover:shadow-xl hover:shadow-gray-600 transition-shadow duration-200 bg-accent-200 hover:bg-accent-300"
            >
              Download
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PurchaseContentBtn;
