"use client";

import { User } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdArrowForward } from "react-icons/md";

const Balances = ({ user }: { user: User }) => {
  const [walletBalance, setWalletBalance] = useState<null | string>();
  const [tokenBalance, setTokenBalance] = useState<null | number>();

  useEffect(() => {
    const fetchWallet = async () => {
      const data = await fetch("/api/intasend/get-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user.walletId }),
      });
      const wallet = await data.json();
      setWalletBalance(wallet.current_balance);
    };
    fetchWallet();
    setTokenBalance(user.tokenBalance);
  }, []);
  return (
    <div className="w-1/2 md:w-1/4 font-inter flex flex-col gap-2">
      <div className=" bg-primary-200 text-white p-4 rounded space-y-4">
        <p className="font-bold">KSH. {walletBalance}</p>
        <Link href={`/withdraw/${user.walletId}`} className="flex items-center gap-1 bg-accent-200 px-3 py-1 rounded-lg">
          <p>Withdraw</p>
          <MdArrowForward className="w-5 h-5" />
        </Link>
      </div>
      <div className="border border-primary-200 bg-background-200 w-full p-2 rounded flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-bold">Token Bal:</p>
          <div className="bg-secondary-200 px-2 py-1 flex gap-1 place-self-end rounded">
            <p>{tokenBalance}</p>
            <Image
              alt="token image"
              src="/images/token.png"
              className="w-6 h-6"
              width={30}
              height={30}
            />
          </div>
        </div>

        <div className="text-sm flex items-center flex-col gap-1">
          <p className="italic text-gray-500">Share to earn tokens</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_BASE_URL}?referrer=${user.uid}`
              );
              toast.success("Referral link copied");
            }}
            className="bg-accent-200 text-white px-3 py-1 rounded-lg"
          >
            Copy Referral Link
          </button>
          <Link
            href={`/tokens2cash/${user.uid}`}
            className="px-3 py-1 rounded-lg border-accent-200 border"
          >
            Convert to Cash
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Balances;
