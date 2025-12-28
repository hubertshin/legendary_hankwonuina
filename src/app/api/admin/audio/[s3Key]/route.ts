import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getStreamUrl, getDownloadUrl } from "@/lib/s3";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/audio/[s3Key]?action=stream|download
 * Get presigned URL for audio file (ADMIN only)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ s3Key: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stream";
    const filename = searchParams.get("filename");

    // Decode s3Key (it's URL encoded)
    const { s3Key: s3KeyParam } = await params;
    const s3Key = decodeURIComponent(s3KeyParam);

    let url: string;
    if (action === "download") {
      url = await getDownloadUrl({
        key: s3Key,
        expiresIn: 3600, // 1 hour
        filename: filename || undefined,
      });
    } else {
      url = await getStreamUrl(s3Key, 3600);
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Admin audio URL generation error:", error);

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to generate audio URL" },
      { status: 500 }
    );
  }
}
