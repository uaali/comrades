import { checkQuota, uploadContent } from "@/utils/content";
import { getBase64Size } from "@/utils/getBase64Size";
import { validateForm } from "@/utils/uploadFileUtils";
import { createDocument, db, storage } from "@/lib/firebase/admin";
import { UploadFormData } from "@/types";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { isProfane } from "no-profanity";
import { revalidatePath } from "next/cache";
import { getDownloadURL } from "firebase-admin/storage";
import { Timestamp } from "firebase-admin/firestore";

const vision = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
    private_key: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
});

export async function POST(request: Request) {
  try {
    let data = await request.json();
    const headers = request.headers;
    const authToken = headers.get("Authorization");
    if (!authToken) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const userId = authToken.split(" ")[1];

    const {
      contentId,
      title,
      price,
      description,
      course,
      tags,
      courseExisted,
    } = data;

    //validate
    if (
      !contentId ||
      !title ||
      !price ||
      !description ||
      !course ||
      !tags ||
      !courseExisted
    ) {
      return NextResponse.json("Missing required fields", { status: 400 });
    }

    //validate if content is for User
    const previewRef = storage.file(`uploads/${userId}/${contentId}/preview`);
    const fileRef = storage.file(`uploads/${userId}/${contentId}/file`);

    if (!previewRef.exists() || !fileRef.exists()) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    // check if file has profane text
    const badTitle = isProfane(data.title);
    const badDescription = isProfane(data.description);
    const badTags = data.tags.some((tag: string) => isProfane(tag));
    if (badTitle || badDescription || badTags) {
      await previewRef.delete();
      await fileRef.delete();
      return NextResponse.json("Content contains profanity", { status: 400 });
    }

    const previewUrl = await getDownloadURL(previewRef);

    //detect people
    if (!vision.faceDetection) {
      throw new Error("Vision API client not properly initialized");
    }
    const [result] = await vision.faceDetection(previewUrl);
    const faces = result.faceAnnotations || [];
    if (faces.length > 0) {
      await previewRef.delete();
      await fileRef.delete();
      return NextResponse.json(
        "Please change the preview. Images with people not allowed",
        {
          status: 400,
        }
      );
    }
    // Check for explicit content
    const [safeSearchResult] = await vision.safeSearchDetection(previewUrl);
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
      await previewRef.delete();
      await fileRef.delete();
      return NextResponse.json("Image contains inappropriate content", {
        status: 400,
      });
    }

    //save course
    if (data.course !== "" && data.courseExisted === false) {
      await createDocument(
        "courses",
        {
          name: data.course,
        },
        createHash("sha256").update(data.course).digest("hex")
      );
    }

    //remove courseExisted from data
    delete data.courseExisted;

    //save files to storage


    revalidatePath("/");

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Error uploading content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
