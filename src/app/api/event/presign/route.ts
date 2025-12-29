import { NextResponse } from "next/server";
import { eventAudioUploadSchema } from "@/lib/validations";
import { generateEventAudioKey, getUploadUrl } from "@/lib/s3";

/**
 * POST /api/event/presign
 * Generate upload info for event audio files (NO AUTH required)
 * Now using S3 for production compatibility
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Event presign request body:", body);

    // Normalize contentType (remove codec info if present)
    if (body.contentType) {
      body.contentType = body.contentType.split(';')[0];
    }

    // Validate request
    const result = eventAudioUploadSchema.safeParse(body);
    if (!result.success) {
      console.error("Event presign validation error:", result.error.flatten());
      console.error("Request body:", body);
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { filename, contentType, size, clipIndex, sessionId } = result.data;
    console.log("Validated data:", { filename, contentType, size, clipIndex, sessionId });

    // Extract file extension
    const extension = filename.split(".").pop() || "webm";
    console.log("File extension:", extension);

    // Generate S3 key
    const s3Key = generateEventAudioKey(sessionId, clipIndex, extension);
    console.log("Generated S3 key:", s3Key);

    // Get presigned upload URL (valid for 1 hour)
    console.log("Generating presigned URL...");
    const uploadUrl = await getUploadUrl({
      key: s3Key,
      contentType,
      expiresIn: 3600,
    });
    console.log("Presigned URL generated successfully");

    return NextResponse.json({
      uploadUrl,
      s3Key,
      clipIndex,
    });
  } catch (error) {
    console.error("Event presign error:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
