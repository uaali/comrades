import { db, getDocument, updateDocument } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoice_id, state, challenge, api_ref } = body;
    if (challenge !== process.env.INTASEND_WEBHOOK_CHALLENGE) {
      return NextResponse.json({ error: "Invalid challenge" }, { status: 400 });
    }
    const transaction = await getDocument("transactions", api_ref);
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    //confirm status
    if (state === "COMPLETE") {
      await updateDocument("transactions", api_ref, {
        status: "complete",
        invoice_id,
      });

      //update content access
      const contentRef = db.collection("uploads").doc(transaction.contentId);
      const purchaseRef = contentRef
        .collection("purchases")
        .doc(transaction.userId);
      await purchaseRef.set({
        transactionId: api_ref,
      });
    } else if (state === "PROCESSING") {
      await updateDocument("transactions", api_ref, {
        status: "processing",
        invoice_id,
      });
    } else if (state === "FAILED") {
      await updateDocument("transactions", api_ref, {
        status: "failed",
        invoice_id,
      });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error purchasing content" },
      { status: 500 }
    );
  }
}
