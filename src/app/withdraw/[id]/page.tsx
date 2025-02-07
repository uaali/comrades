"use client";

import WithdrawalForm from "@/app/components/sections/WithdrawalForm";
import { auth } from "@/lib/firebase/config";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const fetchWallet = async (id: string, token: string) => {
  const data = await fetch(`/api/intasend/get-wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id }),
  });
  const wallet = await data.json();
  return wallet;
};

function calculateWithdrawableAmount(availableBalance: string) {
  const balance = Math.floor(Number(availableBalance));
  const transactionFee = Math.max(
    Math.min(balance * 0.015, 100),
    15
  );
  const withdrawableAmount = Math.floor(balance - transactionFee);
  return Math.max(withdrawableAmount, 0);
}

const Withdraw = () => {
  const [wallet, setWallet] = useState<null | any>(null);
  const [user] = useAuthState(auth);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!user || !id) return;
    const fetchData = async () => {
      const firebaseToken = await user.getIdToken();
      const data = await fetchWallet(id, firebaseToken);
      return data;
    };
    fetchData().then((data) => {
      setWallet(data);
    });
  }, [user, id]);
  if (!wallet || !user || !id) {
    return <p>Loading...</p>;
  }
  let withdrawableAmount = calculateWithdrawableAmount(
    wallet.available_balance
  );
  if (withdrawableAmount < 1) withdrawableAmount = 0;
  return (
    <div className="p-4 md:px-6 font-inter">
      <p className="font-xl font-poppins font-bold md:text-2xl">Withdraw</p>
      <div className="my-4 text-gray-500">
        <p>Charges - 1.5%</p>
        <ul className="list-disc list-inside">
          <li>but cannot be less than Ksh.15</li>
          <li>or exceed Ksh. 100</li>
        </ul>
      </div>
      <div className="my-4">
        <p className="font-bold">Current Balance:</p>
        <p>Ksh. {wallet.available_balance}</p>
        <p>You can withdraw Ksh. {withdrawableAmount.toFixed(0)}</p>
      </div>
      <WithdrawalForm walletBalance={wallet.available_balance} />
    </div>
  );
};

export default Withdraw;
