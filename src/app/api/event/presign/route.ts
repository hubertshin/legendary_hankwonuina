import { NextResponse } from "next/server";
import { eventAudioUploadSchema } from "@/lib/validations";
import { generateEventAudioKey } from "@/lib/s3";

/**
 * POST /api/event/presign
 * Generate upload info for event audio files (NO AUTH required)
 * Using local filesystem instead of S3 for development
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    // Extract file extension
    const extension = filename.split(".").pop() || "webm";

    // Generate S3 key (used as file path)
    const s3Key = generateEventAudioKey(sessionId, clipIndex, extension);

    // Return local upload endpoint instead of S3 presigned URL
    const uploadUrl = "/api/event/upload";

    return NextResponse.json({
      uploadUrl,
      s3Key,
      clipIndex,
      useLocalUpload: true, // Flag to indicate local upload
    });
  } catch (error) {
    console.error("Event presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
