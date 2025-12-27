import { NextResponse } from "next/server";
import { eventAudioUploadSchema } from "@/lib/validations";
import { getUploadUrl, generateEventAudioKey } from "@/lib/s3";

/**
 * POST /api/event/presign
 * Generate presigned S3 upload URL for event audio files (NO AUTH required)
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

    // Generate S3 key
    const s3Key = generateEventAudioKey(sessionId, clipIndex, extension);

    // Get presigned upload URL (valid for 1 hour)
    const uploadUrl = await getUploadUrl({
      key: s3Key,
      contentType,
      expiresIn: 3600,
    });

    return NextResponse.json({
      uploadUrl,
      s3Key,
      clipIndex,
    });
  } catch (error) {
    console.error("Event presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
