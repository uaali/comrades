import { admin, db, getDocument, updateDocument } from "@/lib/firebase/admin";
import bundles from "@/utils/examAIBundles";
import { intraTransfer } from "@/utils/intraTransfer";
import { NextResponse } from "next/server";

const APP_WALLET = "Y279PPK";
const APP_GROW_WALLET = "YRBXGGK";
const MY_PROFIT_WALLET = "YMJLERY";
const TOKENS_PROFIT_WALLET = "Y3EPZ7Y";
const APP_GROW_PROFIT = 0.2;

const calculateProfit = (amount: any): number => {
  const numAmount = Number(Number(amount).toFixed(2)); // Ensure input is also rounded
  if (isNaN(numAmount)) {
    throw new Error("Amount must be convertible to a number");
  }

  let percentage =
    numAmount <= 100 ? 10 : numAmount <= 1000 ? 8 : numAmount <= 10000 ? 5 : 2;

  // Calculate and round profit
  return Number((numAmount * (percentage / 100)).toFixed(2));
};

function getTokensByPrice(price: number) {
  const bundle = bundles.find((b) => b.price === price);
  return bundle?.tokens;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoice_id, state, challenge, api_ref, net_amount, value } = body;

    if (challenge !== process.env.INTASEND_WEBHOOK_CHALLENGE) {
      return NextResponse.json({ error: "Invalid challenge" }, { status: 400 });
    }

    if (api_ref.includes("buytokens")) {
      if (state === "COMPLETE") {
        const userId = api_ref.slice("buytokens".length);
        const purchasedTokens = getTokensByPrice(Number(value));
        if (!purchasedTokens) {
          return NextResponse.json({ error: "Invalid value" }, { status: 400 });
        }
        await db
          .collection("users")
          .doc(userId)
          .update({
            ai_tokens: admin.firestore.FieldValue.increment(purchasedTokens),
          });

        //transfer money to token profit wallet
        await intraTransfer(
          APP_WALLET,
          TOKENS_PROFIT_WALLET,
          Number(net_amount),
          `${userId} AI Tokens Purchase`
        );
      }
      return NextResponse.json("Success", { status: 200 });
    }

    if (state === "COMPLETE") {
      const transaction = await getDocument("transactions", api_ref);
      if (!transaction) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      const batch = db.batch();

      // Update content access
      const contentRef = db.collection("uploads").doc(transaction.contentId);
      const purchaseRef = contentRef
        .collection("purchases")
        .doc(transaction.userId);
      batch.set(purchaseRef, {
        transactionId: api_ref,
      });

      // Round net_amount first to ensure consistent calculations
      const roundedNetAmount = Number(Number(net_amount).toFixed(2));

      // Calculate all amounts with proper rounding
      const profit = calculateProfit(roundedNetAmount);
      const publisherAmount = Number((roundedNetAmount - profit).toFixed(2));
      const appGrowProfit = Number((profit * APP_GROW_PROFIT).toFixed(2));
      // Calculate myProfit as the remainder to ensure no rounding discrepancies
      let myProfit = Number((profit - appGrowProfit).toFixed(2));

      //referrer profit
      if (transaction.referrer) {
        const referrerAmount = Number((myProfit * 0.01).toFixed(2));
        myProfit = Number((myProfit - referrerAmount).toFixed(2));
        const referrerRef = db.collection("users").doc(transaction.referrer);
        batch.update(referrerRef, {
          tokenBalance: admin.firestore.FieldValue.increment(
            Number((referrerAmount * 10).toFixed(1))
          ),
        });
      }

      // Perform transfers
      await intraTransfer(
        APP_WALLET,
        transaction.walletId,
        publisherAmount,
        `Publisher payment for ${transaction.contentId}`
      );

      await intraTransfer(
        APP_WALLET,
        APP_GROW_WALLET,
        appGrowProfit,
        `App grow profit for ${transaction.contentId}`
      );

      await intraTransfer(
        APP_WALLET,
        MY_PROFIT_WALLET,
        myProfit,
        `My profit for ${transaction.contentId}`
      );

      // Update firestore with rounded values
      const transactionDoc = db.collection("transactions").doc(api_ref);
      batch.update(transactionDoc, {
        status: "complete",
        invoice_id,
        charges: Number((transaction.amount - publisherAmount).toFixed(2)),
        netAmount: publisherAmount,
      });

      await batch.commit();
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
