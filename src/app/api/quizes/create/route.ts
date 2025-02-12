export const maxDuration = 60;

import { admin, db } from "@/lib/firebase/admin";
import { jsonSchema, systemPrompt } from "@/utils/examAIConsts";
import { maxExamAIQuestions } from "@/utils/maxExamAIQuestions";
import { NextResponse } from "next/server";

const generateQuestions = async (
  title: string,
  topic: string,
  numberOfQuestions: number
) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Generate ${numberOfQuestions} questions on the topic '${title}'-(${topic}).`,
        },
      ],
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.2,
      presence_penalty: 0.4,
      response_format: {
        type: "json_schema",
        json_schema: jsonSchema,
      },
    }),
  });
  const data = await response.json();
  return data;
};

export async function POST(request: Request) {
  const data = await request.json();
  const headers = request.headers.get("Authorization");
  const userToken = headers?.split(" ")[1];
  const { title, topic, numberOfQuestions } = data;
  try {
    if (!userToken || !title.trim() || !topic.trim()) {
      throw new Error("Field Error");
    }
    if (numberOfQuestions < 3) {
      throw new Error();
    }

    const decodedToken = await admin.auth().verifyIdToken(userToken);
    const userId = decodedToken.uid;

    const quizRef = db.collection("quizes").doc(userId);
    const userRef = db.collection("users").doc(userId);
    const quiz = await quizRef.get();
    if (quiz.exists) {
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        throw new Error();
      }
      const userData = userDoc.data();
      const userTokens = userData?.ai_tokens;
      if (numberOfQuestions > maxExamAIQuestions(false, userTokens)) {
        throw new Error();
      }
      //generate questions and update quiz
      const resp = await generateQuestions(title, topic, numberOfQuestions);
      const totalTokensUsed = resp.usage.total_tokens;
      const parsedResp = JSON.parse(resp.choices[0].message.content);
      const questions = parsedResp.questions;
      await db.runTransaction(async (transaction) => {
        transaction.update(userRef, {
          ai_tokens: Number(userTokens - totalTokensUsed),
        });
        transaction.update(quizRef, {
          title,
          topic,
          questions,
          completed: false,
          userAnswers: [],
        });
      });
      return NextResponse.json({ questions }, { status: 200 });
    } else {
      if (numberOfQuestions > 5) {
        throw new Error();
      }
      //generate questions and create quiz
      const resp = await generateQuestions(title, topic, numberOfQuestions);
      const parsedResp = JSON.parse(resp.choices[0].message.content);
      const questions = parsedResp.questions;
      await db.runTransaction(async (transaction) => {
        transaction.create(quizRef, {
          title,
          topic,
          questions,
        });
      });
      return NextResponse.json({ questions }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json("Internal Server Error", { status: 400 });
  }
}
