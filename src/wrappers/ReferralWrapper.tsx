"use client";

import { updateDocument } from "@/lib/firebase";
import { auth } from "@/lib/firebase/config";
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
    if (!realReferrer) {
      return;
    }
    const storeReferrer = async () => {
      if (!user || !realReferrer) return;
      try {
        await updateDocument("users", user.uid, {
          referrer: realReferrer,
        });
        cookies.remove("referrer");
      } catch (error) {
        return
      }
    };
    if (user && realReferrer) {
      //store referrer in user doc
      storeReferrer();
    }
  }, [user]);

  return null;
};

export default ReferralWrapper;
