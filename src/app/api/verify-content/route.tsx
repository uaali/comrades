import { admin, db } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const headers = req.headers.get("Authorization");
  const userToken = headers?.split(" ")[1];
  try {
    const { contentId, verificationType } = data;
    if (!contentId || !verificationType || !userToken) {
      throw new Error();
    }
    const decodedToken = await admin.auth().verifyIdToken(userToken);
    const userId = decodedToken.uid;
    const contentRef = db.collection("uploads").doc(contentId);
    const content = await contentRef.get();
    if (!content.exists) {
      throw new Error();
    }
    const publisher = content.data()?.publisher;
    if (publisher !== userId) {
      throw new Error();
    }
    const summaryRef = db.collection("summaries").doc(contentId);
    const summary = await summaryRef.get();
    if (!summary.exists) {
      throw new Error();
    }
    const summaryData = summary.data();
    const usedTokens = summaryData?.tokensUsed;
    const userRef = db.collection("users").doc(userId);
    const user = await userRef.get();
    if (!user.exists) {
      throw new Error();
    }
    const userDoc = user.data();
    if (verificationType === "ai") {
      const userTokens = userDoc?.ai_tokens || 0;
      if (userTokens < usedTokens) {
        throw new Error();
      }
      await contentRef.update({
        verified: true,
      });
      await userRef.update({
        ai_tokens: userTokens - usedTokens,
      });
    } else {
      const pendingVerificationRef = db
        .collection("pendingVerifications")
        .doc(contentId);
      await pendingVerificationRef.set({
        createdAt: Timestamp.now(),
      });
      await contentRef.update({
        pendingHumanVerification: true,
      });
    }
    return NextResponse.json("Content verified successfully.", { status: 200 });
  } catch (error) {
    return NextResponse.json("Invalid request", { status: 400 });
  }
}
