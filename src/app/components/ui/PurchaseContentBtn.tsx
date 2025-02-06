"use client";

import { auth, db, provider, storage } from "@/lib/firebase/config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import toast from "react-hot-toast";

const PurchaseContentBtn = ({
  contentId,
  publisherId,
}: {
  contentId: string;
  publisherId: string;
}) => {
  const [status, setStatus] = useState<
    "loading" | "purchase" | "purchasing" | "download" | "checkout"
  >("loading");
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [checkoutLink, setCheckoutLink] = useState<string | null>(null);
  const [user, authLoading] = useAuthState(auth);

  const [purchaseSnap] = useDocument(
    user ? doc(db, `uploads/${contentId}/purchases/${user.uid}`) : null
  );

  const router = useRouter();

  useEffect(() => {
    const checkPurchaseAndGetUrl = async () => {
      // Don't do anything while auth is loading
      if (authLoading) return;

      // If no user, set to purchase state
      if (!user) {
        setStatus("purchase");
        return;
      }

      try {
        if (!purchaseSnap) {
          return;
        }
        if (purchaseSnap.exists()) {
          const fileRef = ref(
            storage,
            `uploads/${publisherId}/${contentId}/file`
          );
          const url = await getDownloadURL(fileRef);
          setDownloadURL(url);
          setStatus("download");
        } else {
          setStatus("purchase");
        }
      } catch (error) {
        console.error("Error in check:", error);
        toast.error("Error checking content status");
        setStatus("purchase");
      }
    };

    checkPurchaseAndGetUrl();
  }, [user, authLoading, contentId,purchaseSnap]);

  const handleDownload = () => {
    if (downloadURL) {
      const link = document.createElement("a");
      link.href = downloadURL;
      link.download = downloadURL.split("/").pop() ?? "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error("Error fetching download link");
    }
  };

  const getCheckoutLink = async () => {
    if (!user) {
      toast.error("You must be logged in to purchase content");
      await signInWithPopup(auth, provider);
      return;
    }
    setStatus("purchasing");
    const toastId = toast.loading("Redirecting you in a few...");
    try {
      const firebaseToken = await user.getIdToken();
      const response = await fetch("/api/intasend/purchase/get-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({ contentId }),
      });
      const data = await response.json();
      if (data.errors || data.error) {
        throw new Error(data.errors || data.error);
      }
      setCheckoutLink(data.checkoutLink);
      setStatus("checkout");
      router.push(data.checkoutLink);
    } catch (error) {
      toast.error("Error purchasing content");
      setStatus("purchase");
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Show loading state while auth is loading
  if (authLoading || status === "loading") {
    return (
      <button
        disabled
        className="py-3 px-8 rounded font-bold tracking-wide bg-accent-300 text-gray-400"
      >
        Loading...
      </button>
    );
  }

  switch (status) {
    case "purchase":
      return (
        <button
          onClick={getCheckoutLink}
          className="py-3 px-8 rounded font-bold tracking-wide text-white shadow shadow-gray-600 hover:shadow-xl hover:shadow-gray-600 transition-shadow duration-200 bg-accent-200 hover:bg-accent-300"
        >
          Purchase
        </button>
      );

    case "purchasing":
      return (
        <button
          disabled
          className="py-3 px-8 rounded font-bold tracking-wide cursor-wait bg-accent-300 text-gray-400"
        >
          Purchasing...
        </button>
      );

    case "download":
      return (
        <button
          onClick={handleDownload}
          className="py-3 px-8 rounded font-bold tracking-wide text-white shadow shadow-gray-600 hover:shadow-xl hover:shadow-gray-600 transition-shadow duration-200 bg-accent-200 hover:bg-accent-300"
        >
          Download
        </button>
      );

    case "checkout":
      return (
        <Link
          href={checkoutLink!}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-accent-200 hover:underline"
        >
          Click here if not redirected
        </Link>
      );
  }
};

export default PurchaseContentBtn;
