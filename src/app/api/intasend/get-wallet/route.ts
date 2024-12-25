import { NextResponse } from "next/server";

const INTASEND_API_KEY = process.env.INTASEND_API_KEY_SECRET;

export async function POST(request: Request) {
  const data = await request.json();
  const id = data.id;
  try {
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    if (!INTASEND_API_KEY) {
      return NextResponse.json(
        { error: "IntaSend API key not configured" },
        { status: 500 }
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
