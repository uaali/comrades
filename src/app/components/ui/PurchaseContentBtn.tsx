"use client";

import { auth, provider } from "@/lib/firebase/config";
import { signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";

const PurchaseContentBtn = ({ contentId }: { contentId: string }) => {
  const [purchasing, setPurchasing] = useState(false);
  const [checkoutLink, setCheckoutLink] = useState<string | null>(null);
  const [user] = useAuthState(auth);
  const router = useRouter();

  const getCheckoutLink = async () => {
    if(!user) {
      toast.error("You must be logged in to purchase content");
      await signInWithPopup(auth,provider)
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
      )}
    </div>
  );
};

export default PurchaseContentBtn;
