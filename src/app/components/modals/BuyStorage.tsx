import React, { useState } from "react";
import { Modal } from "flowbite-react";
import { FaPhone } from "react-icons/fa";
import toast from "react-hot-toast";
import { FaDatabase, FaHardDrive, FaServer } from "react-icons/fa6";
import { FiLayers } from "react-icons/fi";
import { User } from "firebase/auth";

interface StorageBundle {
  id: number;
  size: string;
  price: number;
  icon: React.ElementType;
  saveAmount: number;
}

const StoragePurchaseModal = ({
  openModal,
  setOpenModal,
  user,
}: {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  user: User;
}) => {
  const [selectedBundle, setSelectedBundle] = useState<StorageBundle | null>(
    null
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const storageBundles: StorageBundle[] = [
    {
      id: 1,
      size: "1GB",
      price: 10,
      icon: FaHardDrive,
      saveAmount: 0,
    },
    {
      id: 2,
      size: "5GB",
      price: 49,
      icon: FaDatabase,
      saveAmount: 1,
    },
    {
      id: 3,
      size: "10GB",
      price: 95,
      icon: FaServer,
      saveAmount: 5,
    },
    {
      id: 4,
      size: "20GB",
      price: 150,
      icon: FiLayers,
      saveAmount: 50,
    },
  ];

  const handlePayment = async () => {
    if (!phoneNumber.match(/^0\d{9}$/)) {
      toast.error("Invalid phone number");
      return;
    }

    toast.loading(`Initiating payment for ${selectedBundle?.size}`);

    try {
      // Simulated payment API call
      await fetch("/api/purchase-storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          size: selectedBundle?.size,
          price: selectedBundle?.price,
          phone: phoneNumber,
        }),
      });

      toast.dismiss();
      toast.success(
        `Storage bundle ${selectedBundle?.size} purchased successfully`
      );
      setOpenModal(false);
    } catch (error) {
      toast.dismiss();
      toast.error("Payment failed");
    }

    // Reset states
    setShowPayment(false);
    setSelectedBundle(null);
    setPhoneNumber("");
  };

  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)} size="4xl">
      <Modal.Header>Select Storage Bundle</Modal.Header>
      <Modal.Body>
        {!showPayment ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-5">
            {storageBundles.map((bundle) => (
              <div
                key={bundle.id}
                onClick={() => setSelectedBundle(bundle)}
                className={`relative border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                  selectedBundle?.id === bundle.id
                    ? "ring-2 ring-blue-500"
                    : "hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {bundle.saveAmount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Save {bundle.saveAmount} KSh
                  </div>
                )}
                <div className="flex items-center justify-center mb-2">
                  <bundle.icon className="w-12 h-12 text-blue-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800">{bundle.size}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {bundle.price}
                    </span>
                    <span className="text-sm text-gray-600">KSh</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto p-4">
            <h3 className="text-lg font-semibold mb-4">
              Enter Phone Number for Payment
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
              Selected bundle: {selectedBundle?.size} - KSh{" "}
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
              Pay
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

export default StoragePurchaseModal;
