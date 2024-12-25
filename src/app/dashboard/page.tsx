"use client";

import { auth } from "@/lib/firebase/config";
import { getUser } from "@/lib/users";
import { User } from "@/types";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Balances from "../components/sections/Balances";
import UploadBanner from "../components/sections/UploadBanner";

const Dashboard = () => {
  const [user, loading, error] = useAuthState(auth);
  const [fetchedUser, setFetchedUser] = useState<User | null>();

  useEffect(() => {
    if (!user || error) return;
    const fetchUser = async () => {
      const fetchedUser = await getUser(user.uid);
      setFetchedUser(fetchedUser);
    };
    fetchUser();
  }, [user]);
  // useEffect(() => {
  //   if (!user) return;
  //   const fetchUser = async () => {
  //     const fetchedUser = await getUser(user.uid);
  //     if (fetchedUser.walletId) {
  //       const data = await fetch("/api/intasend/get-wallet", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ id: fetchedUser.walletId }),
  //       });
  //       const wallet = await data.json();
  //       setWallet(wallet);
  //     }
  //   };
  //   fetchUser();
  // }, [user]);
  return (
    <main className="px-4 md:px-6 py-3">
      {loading || (user && !fetchedUser && <p>Loading...</p>)}
      {!loading && !user && <p>Login please</p>}
      {!loading && fetchedUser && (
        <div>
          <div className="w-full flex gap-2">
            <Balances user={fetchedUser} />
            <UploadBanner />
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
