"use client";

import { auth, db } from "@/lib/firebase/config";
import { doc } from "firebase/firestore";
import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  useDocumentData,
  useDocumentDataOnce,
} from "react-firebase-hooks/firestore";
import { FaShieldAlt } from "react-icons/fa";
import { BsLightning } from "react-icons/bs";
import { IoIosPerson } from "react-icons/io";
import toast from "react-hot-toast";
import BuyTokens from "../modals/BuyTokens";

const VerifyAsOwner = ({
  contentId,
  summaryAvailable,
  publisher,
  pendingHumanVerification,
}: {
  contentId: string;
  publisher: string;
  summaryAvailable?: boolean;
  pendingHumanVerification?: boolean;
}) => {
  const [user] = useAuthState(auth);
  const [aiSummary, aiSummaryLoading, error] = useDocumentDataOnce(
    summaryAvailable ? doc(db, "summaries", contentId) : null
  );
  const [fetchedUser] = useDocumentData(
    user ? doc(db, "users", user?.uid) : null
  );
  const [trustModalOpen, setTrustModalOpen] = useState(false);
  const [buyTokensModalOpen, setBuyTokensModalOpen] = useState(false);
  const [verificationType, setVerificationType] = useState<
    null | "ai" | "human"
  >(null);
  const [sending, setSending] = useState(false);
  const isOwner = publisher === user?.uid;

  if (!isOwner || !user) return null;

  const verifyContent = async () => {
    if (verificationType === null) return;
    if (verificationType === "ai") {
      const userTokens = fetchedUser?.ai_tokens || 0;
      if (userTokens < aiSummary?.tokensUsed) {
        setBuyTokensModalOpen(true);
        return;
      }
    }
    setSending(true);
    try {
      toast.loading("Sending Request...");
      const firebaseToken = await user.getIdToken();
      await fetch(`/api/verify-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({
          contentId,
          verificationType,
        }),
      });
      toast.dismiss();
      toast("Success");
      setSending(false);
      window.location.reload();
      setTrustModalOpen(false);
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="mt-6">
      <button
        disabled={pendingHumanVerification}
        onClick={() => {
          if (!fetchedUser) {
            toast.error("Please wait while we fetch your user data.");
            return;
          }
          setTrustModalOpen(true);
        }}
        className={`flex items-center gap-3 ${
          pendingHumanVerification
            ? "bg-gray-300 text-gray-600 cursor-not-allowed text-sm"
            : "shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 text-white hover:to-blue-800 hover:from-blue-700 to-blue-700"
        } px-4 py-3 rounded-lg w-full sm:w-auto`}
      >
        {pendingHumanVerification ? (
          <p>Pending Verification(seen only by you)...</p>
        ) : (
          <>
            <FaShieldAlt className="w-6 h-6" />
            <p className="font-semibold text-lg">
              Boost Your Content's Credibility
            </p>
          </>
        )}
      </button>
      {fetchedUser && (
        <Modal show={trustModalOpen} onClose={() => setTrustModalOpen(false)}>
          <Modal.Header className="border-b border-gray-200">
            Verify Your Content
          </Modal.Header>
          <Modal.Body className="p-6">
            <div className="space-y-4">
              {summaryAvailable && (
                <div
                  className={`cursor-pointer transition-all duration-200 rounded p-2 ${
                    verificationType === "ai" ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setVerificationType("ai")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        verificationType === "ai"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-400"
                      }`}
                    >
                      {verificationType === "ai" && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BsLightning className="w-6 h-6 text-blue-600" />
                          <h4 className="font-semibold text-lg text-gray-800">
                            AI Verification (Instant)
                          </h4>
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          Cost: {aiSummary?.tokensUsed} AI tokens
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          Your content will receive an AI-verified badge with
                          the following summary:
                        </p>
                        <div className="bg-white p-3 rounded-lg text-gray-700">
                          {aiSummaryLoading ? (
                            <div className="animate-pulse h-4 bg-gray-200 rounded" />
                          ) : (
                            aiSummary?.summary
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`cursor-pointer transition-all duration-200 rounded p-2 ${
                  verificationType === "human" ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setVerificationType("human")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      verificationType === "human"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-400"
                    }`}
                  >
                    {verificationType === "human" && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IoIosPerson className="w-6 h-6 text-green-600" />
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800">
                            Human Verification
                          </h4>
                          <p className="text-sm text-gray-600">
                            Processing time: up to 3 days
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        Free
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-t border-gray-200">
            <div className="flex justify-between items-center w-full">
              <Button
                color="gray"
                onClick={() => setTrustModalOpen(false)}
                className="hover:bg-gray-100"
              >
                Cancel
              </Button>
              {verificationType && (
                <button
                  disabled={sending}
                  onClick={verifyContent}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      {verificationType === "ai" ? (
                        <>
                          {fetchedUser.ai_tokens === undefined ||
                          fetchedUser.ai_tokens < aiSummary?.tokensUsed
                            ? "Buy AI tokens (Very Affordable)"
                            : "Verify with AI"}
                        </>
                      ) : (
                        "Verify with Human"
                      )}
                    </>
                  )}
                </button>
              )}
            </div>
          </Modal.Footer>
        </Modal>
      )}
      <BuyTokens
        openModal={buyTokensModalOpen}
        setOpenModal={setBuyTokensModalOpen}
        user={user}
      />
    </div>
  );
};

export default VerifyAsOwner;
