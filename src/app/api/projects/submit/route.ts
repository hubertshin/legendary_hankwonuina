import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { addSTTJob } from "@/lib/queue";
import { submitProjectSchema } from "@/lib/validations";
import { apiLogger } from "@/lib/logger";

// POST /api/projects/submit - Submit project for processing
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = submitProjectSchema.parse(body);

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { audioAssets: true },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.audioAssets.length === 0) {
      return NextResponse.json(
        { error: "No audio files uploaded" },
        { status: 400 }
      );
    }

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "PROCESSING" },
    });

    // Create jobs for each audio asset
    for (const asset of project.audioAssets) {
      // Create job record
      const job = await prisma.job.create({
        data: {
          projectId,
          type: "STT",
          status: "PENDING",
        },
      });

      // Add to queue
      await addSTTJob({
        projectId,
        audioAssetId: asset.id,
        s3Key: asset.s3Key,
      });

      apiLogger.info(
        { jobId: job.id, audioAssetId: asset.id },
        "STT job queued"
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    apiLogger.error({ error }, "Failed to submit project");
    return NextResponse.json(
      { error: "Failed to submit project" },
      { status: 500 }
    );
  }
}
