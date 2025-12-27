import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getStreamUrl } from "@/lib/s3";
import { apiLogger } from "@/lib/logger";

// POST /api/upload/confirm - Confirm upload completion
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { audioAssetId, duration } = body;

    // Verify ownership
    const audioAsset = await prisma.audioAsset.findUnique({
      where: { id: audioAssetId },
      include: { project: true },
    });

    if (!audioAsset || audioAsset.project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Audio asset not found" },
        { status: 404 }
      );
    }

    // Get streaming URL
    const s3Url = await getStreamUrl(audioAsset.s3Key, 86400); // 24 hours

    // Update asset with duration and URL
    await prisma.audioAsset.update({
      where: { id: audioAssetId },
      data: {
        duration,
        s3Url,
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: audioAsset.projectId },
      data: { status: "DRAFT" },
    });

    apiLogger.info({ audioAssetId }, "Upload confirmed");

    return NextResponse.json({ success: true });
  } catch (error) {
    apiLogger.error({ error }, "Failed to confirm upload");
    return NextResponse.json(
      { error: "Failed to confirm upload" },
      { status: 500 }
    );
  }
}
