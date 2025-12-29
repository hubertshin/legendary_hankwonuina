import { NextResponse } from "next/server";
import { z } from "zod";
import { existsSync } from "fs";
import path from "path";

const confirmSchema = z.object({
  s3Key: z.string().min(1),
  duration: z.number().optional(),
});

/**
 * POST /api/event/confirm
 * Confirm audio file upload and get streaming URL (NO AUTH required)
 * Using local filesystem instead of S3 for development
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

    // Check if file exists locally
    const filePath = path.join(process.cwd(), "public", "uploads", s3Key);
    const exists = existsSync(filePath);

    if (!exists) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Return local URL instead of S3 URL
    const s3Url = `/uploads/${s3Key}`;

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
