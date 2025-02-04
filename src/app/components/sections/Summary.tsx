"use client";

import { db } from "@/lib/firebase/config";
import { doc } from "firebase/firestore";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { IoSparklesOutline } from "react-icons/io5";
import TypingEffect from "../ui/TypingEffect";
import { RiErrorWarningLine } from "react-icons/ri";

const Summary = ({
  contentId,
  summaryPurchased,
}: {
  contentId: string;
  summaryPurchased?: boolean;
}) => {
  const [summary, loadingSummary, error] = useDocumentDataOnce(
    summaryPurchased ? doc(db, "summaries", contentId) : null
  );
  return (
    <div className="mt-2">
      {summaryPurchased  ? (
        <div className="bg-blue-300 p-2 rounded relative">
          <div className="flex gap-2 items-center">
            <IoSparklesOutline className="w-5 h-5 text-blue-500" />
            <p className="text-sm font-bold font-poppins">
              AI Summary{" "}
              <span className="bg-blue-100 text-blue-800 border border-blue-400 rounded-lg p-1 font-normal">
                Verified ✓
              </span>
            </p>
          </div>
          <div className="my-2">
            <p>{loadingSummary && "loading..."}</p>
            {summary?.summary && (
              <TypingEffect text={summary.summary} className="text-sm" />
            )}
          </div>
        </div>
      ) : (
        <div className="flex text-sm items-center gap-2 bg-gray-300 text-gray-800 p-2 rounded md:inline-flex">
            <RiErrorWarningLine className="w-5 h-5" />
            <p>Make sure you trust the content provider</p>
        </div>
      )}
    </div>
  );
};

export default Summary;
