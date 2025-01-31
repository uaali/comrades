"use client";

import { useEffect } from "react";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { app } from "@/lib/firebase/config";

const AppCheckWrapper = () => {
  useEffect(() => {
    try {
      if (process.env.NODE_ENV === "development") {
        //@ts-ignore
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(
          process.env.NEXT_PUBLIC_APPCHECK_KEY!
        ),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (error) {
      return;
    }
  }, []);
  return null;
};

export default AppCheckWrapper;
