"use client";

import { auth } from "@/lib/firebase/config";
import { validateAndNormalizePhone } from "@/utils/validatePhoneAndNormalize";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";

const WithdrawalForm = ({ walletBalance }: { walletBalance: string }) => {
  const [amount, setAmount] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [user] = useAuthState(auth);

  const sendOTP = async () => {
    if (parseInt(walletBalance) <= 15) {
      toast.error("You have insufficient funds to withdraw");
      return;
    }
    if (!validateAndNormalizePhone(phone)) {
      toast.error("Invalid phone number");
      return;
    }
    if (!user) {
      toast.error("You need to be logged in to withdraw");
      return;
    }
    setIsModalOpen(true);
  };

  const router = useRouter();

  const handleWithdraw = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    try {
      toast.loading("Verifying OTP...");
      const firebaseToken = await user?.getIdToken();
      const response = await fetch("/api/withdraw/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({
          otp,
          displayName: user?.displayName,
        }),
      });
      toast.dismiss();
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to upload content");
      }
      toast.success("Withdrawal successful");
      router.push("/dashboard");
    } catch (error) {
      toast.dismiss();
      toast.error(
        error instanceof Error ? error.message : "Failed to verify OTP"
      );
    }
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    if (!user) {
      toast.error("You need to be logged in to withdraw");
      return;
    }
    toast.loading("Sending OTP...");
    // Send OTP
    const firebaseToken = await user.getIdToken();
    try {
      const response = await fetch("/api/withdraw/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firebaseToken}`,
        },
        body: JSON.stringify({
          phone,
          amount:Number(amount).toFixed(0),
          email: user.email,
          displayName: user.displayName,
        }),
      });

      toast.dismiss();
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to upload content");
      }
      toast.success("OTP sent successfully");
      setOtpSent(true);
    } catch (error) {
      toast.dismiss();
      toast.error(
        error instanceof Error ? error.message : "Failed to send OTP"
      );
    }
  };

  return (
    <>
      {otpSent ? (
        <div className="w-full md:w-1/2 space-y-3">
          <div>
            <p>
              An OTP has been sent to{" "}
              <span className="font-bold">{user?.email}</span>
            </p>
            <button
              onClick={handleConfirm}
              className="text-blue-600 hover:cursor-pointer text-sm hover:underline"
            >
              Resend
            </button>
          </div>
          <div className="justify-between items-center gap-8 flex">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              placeholder="OTP"
              className="border border-gray-300 p-2 w-full rounded"
            />
            <button
              onClick={handleWithdraw}
              className="bg-blue-600 text-white p-2 rounded"
            >
              Withdraw
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full md:w-1/2 space-y-3">
          <input
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            type="number"
            placeholder="Enter Amount"
            className="border border-gray-300 p-2 rounded"
          />
          <div className="justify-between items-center gap-8 flex">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="Enter Mpesa Number"
              className="border border-gray-300 p-2 w-full rounded"
            />
            <button
              onClick={sendOTP}
              className="bg-blue-600 text-white p-2 rounded text-nowrap"
            >
              Send OTP
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Withdrawal</h3>
            <p className="mb-4">
              Are you sure you want to withdraw{" "}
              <span className="font-bold">Ksh {amount}</span> to{" "}
              <span className="font-bold tracking-wide">{phone}</span>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WithdrawalForm;
