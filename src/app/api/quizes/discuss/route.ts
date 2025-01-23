import { admin, db } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import { encodingForModel } from "js-tiktoken";
import { discussionAISystemPrompt } from "@/utils/examAIConsts";

export async function POST(request: Request) {
  const data = await request.json();
  const headers = request.headers.get("Authorization");
  const userToken = headers?.split(" ")[1];
  try {
    const { messages } = data;
    if (!userToken || !messages || !Array.isArray(messages)) {
      throw new Error("Field Error");
    }
    const decodedToken = await admin.auth().verifyIdToken(userToken);
    const userId = decodedToken.uid;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error();
    }
    const userData = userDoc.data();
    const userTokens = userData?.ai_tokens;

    const sanitizedMessages = messages.map(({ timestamp,id, ...rest }) => rest);

    const systemMessage = {
      content: discussionAISystemPrompt,
      role: "developer",
    };
    sanitizedMessages.push(systemMessage);

    // Load the encoder for the model
    const encoder = encodingForModel("gpt-4o-mini");

    // Count tokens in all messages
    const tokenCounts = sanitizedMessages.map(
      (msg) => encoder.encode(msg.content).length
    );
    const inputTokens = tokenCounts.reduce((sum, count) => sum + count, 0);
    if (inputTokens > 111616) {
      throw new Error("Conversation too long");
    }

    const estimateTokens = inputTokens + 500;
    if (userTokens < estimateTokens) {
      throw new Error("Not enough tokens");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: sanitizedMessages,
      }),
    });

    const responseData = await response.json();
    const message = responseData.choices[0].message.content;
    const usedTokens = responseData.usage.total_tokens;

    await db.collection("users").doc(userId).update({
      ai_tokens: admin.firestore.FieldValue.increment(-usedTokens),
    });
    
    return NextResponse.json({ message }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(error ? error.message : "Error", { status: 400 });
  }
}
