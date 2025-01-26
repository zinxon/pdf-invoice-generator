import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

// Initialize S3 client outside request handler
let S3: S3Client | null = null;

function getS3Client() {
  if (!S3) {
    // Validate environment variables
    const requiredEnvVars = [
      "CLOUDFLARE_R2_ACCESS_KEY_ID",
      "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
      "CLOUDFLARE_R2_BUCKET_NAME",
      "CLOUDFLARE_R2_ENDPOINT",
    ] as const;

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    // Initialize the client
    S3 = new S3Client({
      region: "auto",
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return S3;
}

// Handle cleanup on server shutdown
if (typeof process !== "undefined") {
  const cleanup = async () => {
    try {
      if (S3) {
        await S3.destroy();
        S3 = null;
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  };

  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const s3Client = getS3Client();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate fileName
    if (!fileName) {
      return NextResponse.json(
        { error: "No fileName provided" },
        { status: 400 }
      );
    }

    console.log("Uploading file:", {
      name: fileName,
      size: file.size,
      type: file.type,
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "File content is empty" },
        { status: 400 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type || "application/pdf",
    });

    console.log("Sending to R2...");
    const result = await s3Client.send(command);
    console.log("R2 response:", result.$metadata);

    if (
      !result.$metadata.httpStatusCode ||
      result.$metadata.httpStatusCode !== 200
    ) {
      throw new Error(
        `Failed to upload to R2: ${result.$metadata.httpStatusCode}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      fileName,
      size: buffer.length,
    });
  } catch (error) {
    console.error("Upload error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Error uploading file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
