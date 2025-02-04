import { BundleType } from "@/types";
import bundles from "@/utils/examAIBundles";
import { validateAndNormalizePhone } from "@/utils/validatePhoneAndNormalize";
import { User } from "firebase/auth";
import { Modal } from "flowbite-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaCoins, FaPhone, FaBolt, FaCrown, FaCheck } from "react-icons/fa";

const BuyTokens = ({
  openModal,
  setOpenModal,
  user,
}: {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  user: User;
}) => {
  const [selectedBundle, setSelectedBundle] = useState<BundleType | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const handlePayment = async () => {
    if (!validateAndNormalizePhone(phoneNumber)) {
      toast.error("Invalid phone number");
      return;
    }
    toast.loading(
      `Initiating STK push to ${phoneNumber} for KSh ${selectedBundle?.price}`
    );

    try {
      const firebaseToken = await user.getIdToken();
      const response = await fetch(`/api/buy-tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({
          amount: selectedBundle?.price,
          phone: phoneNumber,
        }),
      });
      if(!response.ok) {
        throw new Error();
      }
      toast.dismiss();
      toast("Wait for tokens to reflect after payment");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to initiate payment");
    }

    setOpenModal(false);
    setShowPayment(false);
    setSelectedBundle(null);
    setPhoneNumber("");
  };

  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)} size="4xl">
      <Modal.Header className="border-b-0">
        <p className="flex gap-2 items-center text-xl">
          <FaCoins className="text-yellow-500" />
          Choose Your Token Bundle
        </p>
      </Modal.Header>
      <Modal.Body className="px-6 py-2">
        {!showPayment ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {bundles.map((bundle) => (
              <div
                key={bundle.price}
                onClick={() => setSelectedBundle(bundle)}
                className={`relative ${
                  bundle.highlight
                    ? "bg-gradient-to-br from-blue-50 to-white border-blue-400 shadow-lg transform scale-105 z-10"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                } border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                  selectedBundle?.price === bundle.price
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                {bundle.highlight && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Best Value!
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-800">
                    {bundle.name}
                  </h3>
                  {bundle.highlight && (
                    <FaBolt className="text-blue-500 ml-1" />
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gray-900">
                    {bundle.price}
                  </span>
                  <span className="text-sm text-gray-600">KSh</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <FaCrown className="text-yellow-500" size={12} />
                    {bundle.tokens.toLocaleString()} tokens
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <FaCheck className="text-green-500" size={12} />
                    ≈ {bundle.questions} questions
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 leading-tight">
                  {bundle.description}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto p-4">
            <h3 className="text-lg font-semibold mb-4">
              Enter Phone Number for M-Pesa Payment
            </h3>
            <div className="flex gap-2 items-center">
              <FaPhone className="text-gray-400" />
              <input
                type="tel"
                placeholder="e.g., 0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Selected bundle: {selectedBundle?.name} - KSh{" "}
              {selectedBundle?.price}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {showPayment ? (
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => setShowPayment(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded"
            >
              Back
            </button>
            <button
              onClick={handlePayment}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Pay with M-Pesa
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => setOpenModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedBundle && setShowPayment(true)}
              disabled={!selectedBundle}
              className={`px-6 py-2 rounded-lg transition-colors ${
                selectedBundle
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BuyTokens;
