import { validateForm } from "@/app/utils/uploadFileUtils";
import { saveToCollection } from "@/lib/firebase/admin";
import { UploadFormDataWithFiles } from "@/types";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { isProfane } from "no-profanity";

const vision = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
    private_key: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
});

export async function POST(request: Request) {
  try {
    const data: UploadFormDataWithFiles = await request.json();
    const validation = validateForm(data);

    if (validation !== true) {
      return NextResponse.json(validation, { status: 400 });
    }

    // check if file follows guidelines
    const badTitle = isProfane(data.title);
    const badDescription = isProfane(data.description);
    const badTags = data.tags.some((tag: string) => isProfane(tag));
    if (badTitle || badDescription || badTags) {
      return NextResponse.json("Content contains profanity", { status: 400 });
    }
    //detect people
    if (!vision.faceDetection) {
      throw new Error("Vision API client not properly initialized");
    }

    if (data.preview instanceof File) {
      return NextResponse.json("File object not supported in this context", {
        status: 400,
      });
    }
    const buffer = Buffer.from(data.preview as string, "base64");
    const [result] = await vision.faceDetection(buffer);
    const faces = result.faceAnnotations || [];
    if (faces.length > 0) {
      return NextResponse.json(
        "Please change the preview. Images with people not allowed",
        {
          status: 400,
        }
      );
    }
    // Check for explicit content
    const [safeSearchResult] = await vision.safeSearchDetection(buffer);
    const safeSearch = safeSearchResult.safeSearchAnnotation;

    if (
      safeSearch &&
      (safeSearch.adult === "LIKELY" ||
        safeSearch.adult === "VERY_LIKELY" ||
        safeSearch.violence === "LIKELY" ||
        safeSearch.violence === "VERY_LIKELY" ||
        safeSearch.racy === "LIKELY" ||
        safeSearch.racy === "VERY_LIKELY")
    ) {
      return NextResponse.json("Image contains inappropriate content", {
        status: 400,
      });
    }

    //save files to storage
    

    // Save data to Firestore
    await saveToCollection("uploads", {
      title: data.title,
      description: data.description,
      price: data.price,
      tags: data.tags,
      publisher: data.publisher,
      createdAt: new Timestamp(new Date().getTime() / 1000, 0),
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
