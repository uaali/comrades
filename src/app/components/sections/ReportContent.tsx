"use client";

import { useState } from "react";
import ReportModal from "../modals/ReportModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase/config";

const ReportContent = ({ contentId }: { contentId: string }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [user] = useAuthState(auth);
  return (
    <div>
      {user && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          id={contentId}
          type="upload"
          userId={user.uid}
        />
      )}

      <p onClick={()=>setShowReportModal(true)} className="text-xs text-blue-500 underline hover:cursor-pointer">
        report
      </p>
    </div>
  );
};

export default ReportContent;
