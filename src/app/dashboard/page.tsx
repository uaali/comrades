"use client";

import { auth, db } from "@/lib/firebase/config";
import { getUser } from "@/lib/users";
import { User } from "@/types";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Balances from "../components/sections/Balances";
import UploadBanner from "../components/sections/UploadBanner";
import { Content } from "@/types";
import DashboardContentContainer from "../components/sections/DashboardContentContainer";
import toast from "react-hot-toast";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const Dashboard = () => {
  const [user, loading, error] = useAuthState(auth);
  const [fetchedUser, setFetchedUser] = useState<User | null>();
  const [currentCategory, setCurrentCategory] = useState("uploaded");
  const [uploadedContent, setUploadedContent] = useState<null | Content[]>();
  const [purchasedContent, setPurchasedContent] = useState<null | Content[]>();

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

  useEffect(() => {
    if (!user) return;
    const fetchUploadedContent = async () => {
      try {
        const q = query(
          collection(db, "uploads"),
          where("publisher", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const content: Content[] = [];
        querySnapshot.forEach((doc) => {
          content.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
          } as Content);
        });
        if (querySnapshot.empty) {
          setUploadedContent([]);
        }
        setUploadedContent(content);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching uploaded content");
      }
    };

    const fetchPurchasedContent = async () => {
      if (!user) return;
      try {
        const transactionsQuery = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          where("status", "==", "complete"),
          orderBy("createdAt", "desc")
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        if (transactionsSnapshot.empty) {
          setPurchasedContent([]);
        }
        const contentIds = transactionsSnapshot.docs.map(
          (doc) => doc.data().contentId
        );
        const fetchContentPromises = contentIds.map((contentId) =>
          getDoc(doc(db, "uploads", contentId))
        );
        const contentSnapshots = await Promise.all(fetchContentPromises);
        const content = contentSnapshots
          .filter((snapshot) => snapshot.exists())
          .map(
            (snapshot) =>
              ({
                id: snapshot.id,
                ...snapshot.data(),
                createdAt: snapshot.data().createdAt.toDate(),
              } as Content)
          );
        setPurchasedContent(content);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching purchased content");
      }
    };
    fetchUploadedContent();
    fetchPurchasedContent();
  }, [user]);
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
          <div className="mt-4 md:mt-8">
            <p className="font-bold font-poppins tracking-wide md:text-lg">
              My Content
            </p>
            <div className="flex gap-14 md:gap-24 items-center font-inter text-sm md:text-base my-2 text-gray-500">
              <p
                onClick={() => setCurrentCategory("uploaded")}
                className={`${
                  currentCategory === "uploaded" && "text-primary-200"
                } hover:cursor-pointer`}
              >
                Uploaded
              </p>
              <p
                onClick={() => setCurrentCategory("purchased")}
                className={`${
                  currentCategory === "purchased" && "text-primary-200"
                } hover:cursor-pointer`}
              >
                Purchased
              </p>
            </div>
          </div>
          <div className="mt-4 border border-gray-200"></div>
          <div className="mt-4">
            {uploadedContent && purchasedContent ? (
              <DashboardContentContainer
                editable={currentCategory === "uploaded" ? true : false}
                content={
                  currentCategory === "uploaded"
                    ? uploadedContent
                    : purchasedContent
                }
              />
            ) : (
              <p>Loading Content...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
