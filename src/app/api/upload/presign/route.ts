import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getUploadUrl, generateAudioKey } from "@/lib/s3";
import { audioUploadSchema } from "@/lib/validations";
import { apiLogger } from "@/lib/logger";
import { getFileExtension } from "@/lib/utils";

const MAX_CLIPS = 3;

// POST /api/upload/presign - Get presigned URL for audio upload
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let { projectId, clipIndex, filename, contentType, size } = body;

    // Normalize contentType (remove codec info if present)
    if (contentType) {
      contentType = contentType.split(';')[0];
    }

    // Validate input
    audioUploadSchema.parse({
      filename,
      contentType,
      size,
      clipIndex,
    });

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { audioAssets: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check clip limit
    if (project.audioAssets.length >= MAX_CLIPS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_CLIPS} clips allowed` },
        { status: 400 }
      );
    }

    // Check for existing clip at this index
    const existingClip = project.audioAssets.find(
      (a) => a.clipIndex === clipIndex
    );

    // Generate S3 key
    const extension = getFileExtension(filename) || "webm";
    const s3Key = generateAudioKey(
      session.user.id,
      projectId,
      clipIndex,
      extension
    );

    // Create or update audio asset record
    let audioAsset;
    if (existingClip) {
      audioAsset = await prisma.audioAsset.update({
        where: { id: existingClip.id },
        data: {
          filename: `clip-${clipIndex}.${extension}`,
          originalName: filename,
          mimeType: contentType,
          size,
          s3Key,
        },
      });
    } else {
      audioAsset = await prisma.audioAsset.create({
        data: {
          projectId,
          clipIndex,
          filename: `clip-${clipIndex}.${extension}`,
          originalName: filename,
          mimeType: contentType,
          size,
          s3Key,
        },
      });
    }

    // Generate presigned URL
    const uploadUrl = await getUploadUrl({
      key: s3Key,
      contentType,
      expiresIn: 3600, // 1 hour
    });

    apiLogger.info(
      { audioAssetId: audioAsset.id, s3Key },
      "Presigned URL generated"
    );

    return NextResponse.json({
      uploadUrl,
      audioAssetId: audioAsset.id,
      s3Key,
    });
  } catch (error) {
    apiLogger.error({ error }, "Failed to generate presigned URL");
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
