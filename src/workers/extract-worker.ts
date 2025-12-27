import { Job, Processor } from "bullmq";
import openai, { PROMPTS } from "@/lib/openai";
import prisma from "@/lib/db";
import { addWriteJob } from "@/lib/queue";
import { workerLogger } from "@/lib/logger";
import type { ExtractJobData } from "@/lib/queue";

export const extractProcessor: Processor<ExtractJobData> = async (
  job: Job<ExtractJobData>
) => {
  const { projectId, transcriptIds } = job.data;

  workerLogger.info({ jobId: job.id, projectId }, "Starting extraction");

  try {
    // Update job status
    await prisma.job.updateMany({
      where: { projectId, type: "EXTRACT", status: "PENDING" },
      data: { status: "PROCESSING", startedAt: new Date() },
    });

    await job.updateProgress(10);

    // Get all transcripts
    const transcripts = await prisma.transcript.findMany({
      where: { id: { in: transcriptIds } },
      orderBy: { createdAt: "asc" },
    });

    // Combine transcripts
    const combinedTranscript = transcripts
      .map((t, i) => `[녹음 ${i + 1}]\n${t.text}`)
      .join("\n\n");

    await job.updateProgress(20);

    // Call OpenAI to extract story elements
    const prompt = PROMPTS.EXTRACT_STORY.replace(
      "{{transcript}}",
      combinedTranscript
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a Korean autobiography expert. Extract story elements and return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    await job.updateProgress(70);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const extractedData = JSON.parse(content);

    // Save extracted story
    const story = await prisma.extractedStory.upsert({
      where: { projectId },
      create: {
        projectId,
        data: extractedData,
      },
      update: {
        data: extractedData,
        version: { increment: 1 },
      },
    });

    // Update job status
    await prisma.job.updateMany({
      where: { projectId, type: "EXTRACT" },
      data: { status: "COMPLETED", completedAt: new Date(), progress: 100 },
    });

    await job.updateProgress(100);

    // Create write job
    await prisma.job.create({
      data: {
        projectId,
        type: "WRITE",
        status: "PENDING",
      },
    });

    await addWriteJob({
      projectId,
      storyId: story.id,
    });

    workerLogger.info({ jobId: job.id, storyId: story.id }, "Extraction complete");

    return { storyId: story.id };
  } catch (error) {
    workerLogger.error({ jobId: job.id, error }, "Extraction failed");

    await prisma.job.updateMany({
      where: { projectId, type: "EXTRACT" },
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
