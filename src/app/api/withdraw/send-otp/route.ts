import { admin, createDocument, db } from "@/lib/firebase/admin";
import { generateRandomStr } from "@/utils/generateRandomStr";
import { sendOTP } from "@/utils/sendOTP";
import { validateAndNormalizePhone } from "@/utils/validatePhoneAndNormalize";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const headers = request.headers.get("Authorization");
  const userToken = headers?.split(" ")[1];
  try {
    const { phone, amount, email, displayName } = await request.json();
    //validation
    if (!userToken) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const decodedToken = await admin.auth().verifyIdToken(userToken);
    const userId = decodedToken.uid;
    if (!validateAndNormalizePhone(phone)) {
      return NextResponse.json("Invalid phone number", { status: 400 });
    }
    if (!userId) {
      return NextResponse.json("You need to be logged in to withdraw", {
        status: 400,
      });
    }
    if (!email) {
      return NextResponse.json("Email is required", { status: 400 });
    }

    const formattedPhone: string = validateAndNormalizePhone(phone)!;

    // Generate 6-digit OTP
    const otp = generateRandomStr();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    let shouldSendOTP = true;
    let errorResponse = null;

    await db.runTransaction(async (transaction) => {
      const docRef = db.collection("withdrawal_otps").doc(userId);
      const docSnap = await transaction.get(docRef);
      const MAX_TRIES = 2;
      const TRY_AGAIN_DELAY = 5 * 60 * 1000;

      if (docSnap.exists) {
        const data = docSnap.data()!;
        const retries = (data.retries || 0) + 1;

        // Check if user is in timeout period
        if (data.tryAgain && data.tryAgain.toDate() > new Date()) {
          shouldSendOTP = false;
          errorResponse = NextResponse.json(
            "Too many retries. Come back after 5 minutes",
            { status: 400 }
          );
          return;
        }

        // Check if exceeded max retries
        if (retries > MAX_TRIES) {
          const tryAgain = new Date(Date.now() + TRY_AGAIN_DELAY);
          transaction.update(docRef, {
            retries: 0,
            tryAgain,
          });
          shouldSendOTP = false;
          errorResponse = NextResponse.json(
            "Too many retries. Come back after 5 minutes",
            { status: 400 }
          );
          return;
        }

        // Update existing document
        transaction.update(docRef, {
          otp,
          expiresAt,
          retries,
        });
      } else {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          shouldSendOTP = false;
          errorResponse = NextResponse.json("User not found", { status: 400 });
          return;
        }
        const userData = userDoc.data()!;
        const walletId = userData.walletId;
        // Create new document
        transaction.set(docRef, {
          phone: formattedPhone,
          email,
          amount,
          otp,
          expiresAt,
          retries: 1,
          walletId,
        });
      }
    });

    // Handle any errors that occurred during the transaction
    if (errorResponse) {
      return errorResponse;
    }

    // Only send OTP if no errors occurred
    if (shouldSendOTP) {
      await sendOTP({ email, otp, phone: formattedPhone, amount, displayName });
      return NextResponse.json("OTP sent successfully", { status: 200 });
    }
  } catch (error) {
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
