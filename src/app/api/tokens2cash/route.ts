import { admin, db } from "@/lib/firebase/admin";
import { intraTransfer } from "@/utils/intraTransfer";
import { NextResponse } from "next/server";


const APP_WALLET = "Y279PPK";

export async function POST(req: Request) {
  const data = await req.json();
  const headers = req.headers.get("Authorization");
  const userToken = headers?.split(" ")[1];
  try {
    const { amount } = data;
    if (!amount || !userToken) {
      throw new Error();
    }
    const decodedToken = await admin.auth().verifyIdToken(userToken);
    const userId = decodedToken.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error();
    }
    const user = userDoc.data();
    if (!user) {
      throw new Error();
    }
    if (user.tokenBalance < amount) {
      throw new Error();
    }
    const walletId = user.walletId;

    let convertedAmount = Number((amount / 10).toFixed(1));
    await intraTransfer(
      APP_WALLET,
      walletId,
      convertedAmount,
      `${userId} Tokens Conversion`
    );
    await userRef.update({
      tokenBalance: admin.firestore.FieldValue.increment(
        -Number(amount.toFixed(1))
      ),
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
