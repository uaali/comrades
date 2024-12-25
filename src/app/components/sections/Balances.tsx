"use client";

import { updateUser } from "@/lib/users";
import { User } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MdArrowForward } from "react-icons/md";

const Balances = ({ user }: { user: User }) => {
  const [walletBalance, setWalletBalance] = useState<null | string>();
  const [tokenBalance, setTokenBalance] = useState<null | number>();
  useEffect(() => {
    if (user.walletId) {
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
    } else {
      const createWallet = async () => {
        const wallet = await fetch("/api/intasend/create-wallet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid: user.uid }),
        });
        const walletData = await wallet.json();
        console.log(walletData);
        if (walletData.error) {
          console.error(walletData.error);
          return;
        }
        await updateUser(user.uid, { walletId: walletData.wallet_id });
        setWalletBalance(walletData.available_balance);
      };
      createWallet();
    }
    if (typeof user.tokenBalance === "number") {
      setTokenBalance(user.tokenBalance);
    } else {
      updateUser(user.uid, { tokenBalance: 0 });
    }
  }, []);
  return (
    <div className="w-1/2 md:w-1/4 font-inter flex flex-col gap-2">
      <div className=" bg-primary-200 text-white p-4 rounded space-y-4">
        <p className="font-bold">KSH. {walletBalance}</p>
        <button className="flex items-center gap-1 bg-accent-200 px-3 py-1 rounded-lg">
          <p>Withdraw</p>
          <MdArrowForward className="w-5 h-5" />
        </button>
      </div>
      <div className="border border-primary-200 bg-background-200 w-full p-2 rounded flex flex-col gap-2">
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
        <Link
          href="/blog/convert-tokens"
          className="text-sm underline text-primary-300 text-center"
        >
          How do I convert to cash?
        </Link>
      </div>
    </div>
  );
};

export default Balances;
