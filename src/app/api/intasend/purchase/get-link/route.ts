import { createDocument, getDocument } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import IntaSend from "intasend-node";
import { Timestamp } from "firebase-admin/firestore";

const intasend = new IntaSend(
  process.env.INTASEND_API_KEY_PUBLIC!,
  process.env.INTASEND_API_KEY_SECRET!,
  false
);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { contentId, userId } = data;

    //get content price from firestore
    const content = await getDocument("uploads", contentId);
    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }
    const price = content.price;

    //create transaction in firestore
    const transactionId = await createDocument("transactions", {
      userId,
      contentId,
      amount: price,
      currency: "KES",
      status: "pending",
      createdAt: Timestamp.now(),
    });
    //generate checkout link
    let collection = intasend.collection();
    const response = await collection.charge({
      currency: "KES",
      amount: price,
      api_ref: transactionId,
      redirect_url: `${process.env.BASE_URL}/content/${contentId}`,
    });

    return NextResponse.json({ checkoutLink: response.url }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error purchasing content" },
      { status: 500 }
    );
  }
}
