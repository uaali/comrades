import { admin } from "@/lib/firebase/admin";
import { validateAndNormalizePhone } from "@/utils/validatePhoneAndNormalize";
import { NextResponse } from "next/server";

const INTASEND_API_KEY = process.env.INTASEND_API_KEY_SECRET;

export async function POST(request: Request) {
  const data = await request.json();
  const headers = request.headers.get("Authorization");
  const userToken = headers?.split(" ")[1];
  try {
    const { amount, phone } = data;
    if (!amount || !phone || !userToken) {
      throw new Error();
    }
    const formattedPhone = validateAndNormalizePhone(phone);
    if (!formattedPhone) {
      throw new Error();
    }
    const decodedToken = await admin.auth().verifyIdToken(userToken);
    const userId = decodedToken.uid;

    const response = await fetch(
      `https://payment.intasend.com/api/v1/payment/mpesa-stk-push/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${INTASEND_API_KEY}`,
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          amount,
          api_ref: `buystorage${userId}`,
        }),
      }
    );
    const respData = await response.json();
    console.log(respData);
    return NextResponse.json("Success", { status: 200 });
  } catch {
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
