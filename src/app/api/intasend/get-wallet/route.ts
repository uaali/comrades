import { NextResponse } from "next/server";

const INTASEND_API_KEY = process.env.INTASEND_API_KEY;
const INTASEND_PUBLISHABLE_KEY =
  "ISPubKey_test_a51c4335-0b42-4dd3-b7fa-d37aa35dc0ec";

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
      `https://sandbox.intasend.com/api/v1/wallets/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${INTASEND_API_KEY}`,
        },
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
