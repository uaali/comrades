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

    let isSubscribed = true;
    let retryCount = 0;
    const maxRetries = 5;

    const fetchUser = async () => {
      try {
        const fetchedUser = await getUser(user.uid);

        if (!isSubscribed) return;

        if (fetchedUser) {
          setFetchedUser(fetchedUser);
        } else if (retryCount < maxRetries) {
          retryCount++;
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          setTimeout(fetchUser, delay);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        // Handle error appropriately
      }
    };

    fetchUser();

    return () => {
      isSubscribed = false;
    };
  }, [user, error]);
  return (
    <div className="px-4 md:px-6 py-3">
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
    </div>
  );
};

export default Dashboard;
