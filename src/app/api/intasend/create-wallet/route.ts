import { NextResponse } from "next/server";

const INTASEND_API_KEY = process.env.INTASEND_API_KEY_SECRET;

export async function POST(request: Request) {
    const data = await request.json();
    const uid= data.uid;
  try {
    if (!uid) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    if (!INTASEND_API_KEY) {
      return NextResponse.json(
        { error: "IntaSend API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://sandbox.intasend.com/api/v1/wallets/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${INTASEND_API_KEY}`,
        },
        body: JSON.stringify({
          currency: "KES",
          wallet_type: "WORKING",
          can_disburse: true,
          label: `${uid}v4`,
        }),
      }
    );


    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
