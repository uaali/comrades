import { db, getDocument, updateDocument } from "@/lib/firebase/admin";
import IntaSend from "intasend-node";
import { NextResponse } from "next/server";

const APP_WALLET = "Y279PPK";
const APP_GROW_WALLET = "Y6W8L9Y"; //tirigist
const MY_PROFIT_WALLET = "Y5XLBGK"; //kuriamuchuni
const APP_GROW_PROFIT = 0.2;
const MY_PROFIT = 0.8;
const calculateProfit = (amount: any): number => {
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    throw new Error("Amount must be convertible to a number");
  }

  let percentage =
    numAmount <= 100 ? 10 : numAmount <= 1000 ? 8 : numAmount <= 10000 ? 5 : 2;

  return Number(((numAmount * percentage) / 100).toFixed(2));
};

let intasend = new IntaSend(
  process.env.INTASEND_API_KEY_PUBLIC!,
  process.env.INTASEND_API_KEY_SECRET!,
  false
);
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoice_id, state, challenge, api_ref, charges, net_amount } = body;
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
      //update content access
      const contentRef = db.collection("uploads").doc(transaction.contentId);
      const purchaseRef = contentRef
        .collection("purchases")
        .doc(transaction.userId);
      await purchaseRef.set({
        transactionId: api_ref,
      });

      const wallets = intasend.wallets();

      //fund wallets
      const walletId = transaction.walletId;
      const profit = calculateProfit(net_amount);
      const publisherAmount = net_amount - profit;
      const appGrowProfit = profit * APP_GROW_PROFIT;
      const myProfit = profit * MY_PROFIT;
      //publisher
      await wallets.intraTransfer(
        APP_WALLET,
        walletId,
        publisherAmount,
        `Publisher payment for ${transaction.contentId}`
      );
      //app_grow
      await wallets.intraTransfer(
        APP_WALLET,
        APP_GROW_WALLET,
        appGrowProfit,
        `App grow profit for ${transaction.contentId}`
      );

      //my profit
      await wallets.intraTransfer(
        APP_WALLET,
        MY_PROFIT_WALLET,
        myProfit,
        `My profit for ${transaction.contentId}`
      );

      //update firestore
      await updateDocument("transactions", api_ref, {
        status: "complete",
        invoice_id,
        charges: net_amount - publisherAmount,
        netAmount: publisherAmount,
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
