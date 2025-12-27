import { Job, Processor } from "bullmq";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";
import openai from "@/lib/openai";
import prisma from "@/lib/db";
import { addExtractJob } from "@/lib/queue";
import { workerLogger } from "@/lib/logger";
import type { STTJobData } from "@/lib/queue";

const BUCKET = process.env.S3_BUCKET || "hankwon-uina-audio";

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export const sttProcessor: Processor<STTJobData> = async (job: Job<STTJobData>) => {
  const { projectId, audioAssetId, s3Key } = job.data;

  workerLogger.info({ jobId: job.id, audioAssetId }, "Starting STT processing");

  try {
    // Update job status
    await prisma.job.updateMany({
      where: { projectId, type: "STT", status: "PENDING" },
      data: { status: "PROCESSING", startedAt: new Date() },
    });

    await job.updateProgress(10);

    // Get audio file from S3
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const audioBuffer = await response.Body?.transformToByteArray();

    if (!audioBuffer) {
      throw new Error("Failed to download audio file");
    }

    await job.updateProgress(30);

    // Convert to File for OpenAI API
    const audioFile = new File([audioBuffer], "audio.webm", {
      type: response.ContentType || "audio/webm",
    });

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ko",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    await job.updateProgress(80);

    // Parse segments
    const segments: TranscriptSegment[] =
      (transcription as unknown as { segments?: Array<{ start: number; end: number; text: string }> }).segments?.map((seg) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
      })) || [];

    // Save transcript to database
    await prisma.transcript.create({
      data: {
        audioAssetId,
        projectId,
        text: transcription.text,
        segments: segments,
        language: "ko",
      },
    });

    // Update job status
    await prisma.job.updateMany({
      where: { projectId, type: "STT" },
      data: { status: "COMPLETED", completedAt: new Date(), progress: 100 },
    });

    await job.updateProgress(100);

    // Check if all STT jobs for this project are complete
    const remainingSTTJobs = await prisma.job.count({
      where: {
        projectId,
        type: "STT",
        status: { not: "COMPLETED" },
      },
    });

    if (remainingSTTJobs === 0) {
      // All transcriptions complete, start extraction
      const transcripts = await prisma.transcript.findMany({
        where: { projectId },
      });

      // Create extract job record
      await prisma.job.create({
        data: {
          projectId,
          type: "EXTRACT",
          status: "PENDING",
        },
      });

      await addExtractJob({
        projectId,
        transcriptIds: transcripts.map((t) => t.id),
      });

      workerLogger.info({ projectId }, "Extract job queued");
    }

    workerLogger.info({ jobId: job.id, audioAssetId }, "STT processing complete");

    return { transcriptId: audioAssetId };
  } catch (error) {
    workerLogger.error({ jobId: job.id, error }, "STT processing failed");

    await prisma.job.updateMany({
      where: { projectId, type: "STT" },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "FAILED" },
    });

    throw error;
  }
};
