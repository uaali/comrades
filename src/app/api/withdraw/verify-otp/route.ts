import { admin, createDocument, db } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import IntaSend from "intasend-node";

const intasend = new IntaSend(
  process.env.INTASEND_API_KEY_PUBLIC,
  process.env.INTASEND_API_KEY_SECRET,
  false
);

export async function POST(request: Request) {
  const headers = request.headers.get("Authorization");
  const userToken = headers?.split(" ")[1];
  try {
    const { otp, displayName } = await request.json();
    if (!userToken) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const decodedToken = await admin.auth().verifyIdToken(userToken);
    const userId = decodedToken.uid;
    if (!userId) {
      return NextResponse.json("You need to be logged in to withdraw", {
        status: 400,
      });
    }

    if (!otp) {
      return NextResponse.json("OTP is required", { status: 400 });
    }

    const transactionResult = await db.runTransaction(async (transaction) => {
      const otpRef = db.collection("withdrawal_otps").doc(userId);
      const otpDoc = await transaction.get(otpRef);

      if (!otpDoc.exists) {
        return { error: "OTP not found", status: 400 };
      }

      const data = otpDoc.data()!;

      if (data.expiresAt.toDate() < new Date()) {
        transaction.delete(otpRef);
        return { error: "OTP has expired", status: 400 };
      }

      if (data.otp !== otp) {
        return { error: "Invalid OTP", status: 400 };
      }

      transaction.delete(otpRef);

      return {
        success: true,
        data: {
          amount: data.amount,
          phone: data.phone,
          walletId: data.walletId,
        },
      };
    });

    if ("error" in transactionResult) {
      return NextResponse.json(transactionResult.error, {
        status: transactionResult.status,
      });
    }

    const { amount, phone, walletId } = transactionResult.data;
    const payouts = intasend.payouts();

    try {
      const response = await payouts.mpesa({
        currency: "KES",
        transactions: [
          {
            name: displayName,
            account: phone,
            amount,
            narrative: "Withdrawal from wallet",
          },
        ],
        wallet_id: walletId,
      });
      await payouts.approve(response);

      await createDocument("withdrawals", {
        userId,
        amount,
        phone,
        walletId,
        createdAt: new Date(),
      }); // Save withdrawal details to Firestore
      return NextResponse.json("Withdrawal successful", { status: 200 });
    } catch (error: any) {
      // Handle IntaSend error object
      if (error && typeof error === "object") {
        // If error is already parsed JSON
        if (error.type === "validation_error") {
          const errorMessage =
            error.errors?.[0]?.detail || "Validation error occurred";
          return NextResponse.json(errorMessage, { status: 400 });
        }

        // If error is a Buffer
        if (error.type === "Buffer" && Array.isArray(error.data)) {
          try {
            const bufferString = Buffer.from(error.data).toString();
            const parsedError = JSON.parse(bufferString);
            const errorMessage =
              parsedError.errors?.[0]?.detail || "IntaSend error occurred";
            return NextResponse.json(errorMessage, { status: 400 });
          } catch {
            // If parsing fails, return the stringified error
            return NextResponse.json(
              "IntaSend error: " + JSON.stringify(error),
              { status: 400 }
            );
          }
        }
      }

      // Fallback error handling
      return NextResponse.json("Bad Request", { status: 500 });
    }
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
