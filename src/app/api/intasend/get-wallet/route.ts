import { admin, db } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

const INTASEND_API_KEY = process.env.INTASEND_API_KEY_SECRET;

export async function POST(request: Request) {
  const data = await request.json();
  const headers = request.headers.get("Authorization");
  const userToken = headers?.split(" ")[1];
  const id = data.id;
  try {
    if (!id || !userToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!INTASEND_API_KEY) {
      return NextResponse.json(
        { error: "IntaSend API key not configured" },
        { status: 500 }
      );
    }
    const decodedToken = await admin.auth().verifyIdToken(userToken);
    const userId = decodedToken.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userData = userDoc.data();
    if (!userData) {
      return NextResponse.json(
        { error: "User data not found" },
        { status: 500 }
      );
    }
    if (userData.walletId !== id) {
      return NextResponse.json(
        { error: "User does not own this wallet" },
        { status: 403 }
      );
    }
    const response = await fetch(
      `https://payment.intasend.com/api/v1/wallets/${id}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${INTASEND_API_KEY}`,
        },
      }
    );

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
