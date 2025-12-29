import { NextResponse } from "next/server";
import { z } from "zod";
import { fileExists, getStreamUrl } from "@/lib/s3";

const confirmSchema = z.object({
  s3Key: z.string().min(1),
  duration: z.number().optional(),
});

/**
 * POST /api/event/confirm
 * Confirm audio file upload and get streaming URL (NO AUTH required)
 * Now using S3 for production compatibility
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const result = confirmSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { s3Key, duration } = result.data;

    // Check if file exists in S3
    const exists = await fileExists(s3Key);
    if (!exists) {
      return NextResponse.json(
        { error: "File not found in S3" },
        { status: 404 }
      );
    }

    // Generate streaming URL (valid for 24 hours)
    const s3Url = await getStreamUrl(s3Key, 86400);

    return NextResponse.json({
      s3Key,
      s3Url,
      duration,
      confirmed: true,
    });
  } catch (error) {
    console.error("Event confirm error:", error);
    return NextResponse.json(
      { error: "Failed to confirm upload" },
      { status: 500 }
    );
  }
}
