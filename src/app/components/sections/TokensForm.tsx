"use client";

import { auth } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";

const TokensForm = ({ tokens }: { tokens: number }) => {
  const [converting, setConverting] = useState(false);
  const [amount, setAmount] = useState(10);
  const [user, loading, error] = useAuthState(auth);

  const router = useRouter();

  const convertToCash = async () => {
    if (!user) return toast.error("You need to be logged in to convert tokens");
    if (amount < 10) {
      return toast.error("Minimum Token for conversion is 10");
    }
    if (amount > tokens) {
      return toast.error("Insufficient tokens");
    }
    setConverting(true);
    toast.loading("Converting tokens...");
    try {
      const firebaseToken = await user.getIdToken();
      const response = await fetch("/api/tokens2cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error();
      toast.dismiss();
      toast.success("Conversion successful, Check Dashboard");
      router.push("/dashboard");
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred");
    }
    setConverting(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error)
    return <div>Error: {error.message}. Contact Ali(support): 0768947958</div>;
  if (!user) return <div>You need to be logged in to convert tokens</div>;
  return (
    <div className="flex gap-2 justify-center items-center">
      <div className="space-y-1">
        <input
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          type="number"
        />
        <p className="text-sm text-gray-500">
          = {(amount / 10).toFixed(1)} Ksh
        </p>
      </div>
      <button
        onClick={convertToCash}
        disabled={converting}
        className="bg-accent-200 hover:bg-accent-300 text-white px-3 py-2 self-start rounded-lg"
      >
        {converting ? "Converting..." : "Convert"}
      </button>
    </div>
  );
};

export default TokensForm;
