import { checkQuota, uploadContent } from "@/utils/content";
import { getBase64Size } from "@/utils/getBase64Size";
import { validateForm } from "@/utils/uploadFileUtils";
import { createDocument, db } from "@/lib/firebase/admin";
import { UploadFormDataWithFiles } from "@/types";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { createHash } from "crypto";
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
    let data: UploadFormDataWithFiles = await request.json();

    //get sizes
    const previewSize = getBase64Size(data.preview as string);
    const fileSize = getBase64Size(data.file as string);

    //change files to buffer
    const previewBuffer = Buffer.from(data.preview as string, "base64");
    const fileBuffer = Buffer.from(data.file as string, "base64")
    const {preview, file, ...rest} = data;
    data = rest;

    // //validate
    // const validation = validateForm(data);
    // if (validation !== true) {
    //   return NextResponse.json(validation, { status: 400 });
    // }

    // // check if file follows guidelines
    // const badTitle = isProfane(data.title);
    // const badDescription = isProfane(data.description);
    // const badTags = data.tags.some((tag: string) => isProfane(tag));
    // if (badTitle || badDescription || badTags) {
    //   return NextResponse.json("Content contains profanity", { status: 400 });
    // }

    // //detect people
    // if (!vision.faceDetection) {
    //   throw new Error("Vision API client not properly initialized");
    // }
    // const [result] = await vision.faceDetection(previewBuffer);
    // const faces = result.faceAnnotations || [];
    // if (faces.length > 0) {
    //   return NextResponse.json(
    //     "Please change the preview. Images with people not allowed",
    //     {
    //       status: 400,
    //     }
    //   );
    // }
    // // Check for explicit content
    // const [safeSearchResult] = await vision.safeSearchDetection(previewBuffer);
    // const safeSearch = safeSearchResult.safeSearchAnnotation;

    // if (
    //   safeSearch &&
    //   (safeSearch.adult === "LIKELY" ||
    //     safeSearch.adult === "VERY_LIKELY" ||
    //     safeSearch.violence === "LIKELY" ||
    //     safeSearch.violence === "VERY_LIKELY" ||
    //     safeSearch.racy === "LIKELY" ||
    //     safeSearch.racy === "VERY_LIKELY")
    // ) {
    //   return NextResponse.json("Image contains inappropriate content", {
    //     status: 400,
    //   });
    // }

    //check usage quota
    const hasQuota = await checkQuota(data.publisher, previewSize + fileSize);
    if (!hasQuota) {
      return NextResponse.json("Storage limit exceeded", { status: 400 });
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
    await uploadContent({
      data,
      previewFile: previewBuffer,
      file: fileBuffer,
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.log("Error uploading content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
