"use client";

import { updateDocument } from "@/lib/firebase";
import { auth, db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { useCookies } from "next-client-cookies";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

const ReferralWrapper = () => {
  const [user] = useAuthState(auth);
  const searchParams = useSearchParams();
  const referrer = searchParams.get("referrer");
  const cookies = useCookies();

  useEffect(() => {
    if (referrer) {
      cookies.set("referrer", referrer, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
    }
    const storedCookie = cookies.get("referrer");
    const realReferrer = storedCookie || referrer;

    const storeReferrer = async () => {
      if (!user || !realReferrer) return;
      try {
        const docRef = doc(db, "users", user.uid);
        if (!docRef) return;
        await updateDoc(docRef, { referrer: realReferrer });
        cookies.remove("referrer");
      } catch (error) {
        console.log(error);
      }
    };

    if (user && realReferrer) {
      storeReferrer();
    }
  }, [user, referrer, cookies]);

  return null;
};

export default ReferralWrapper;
