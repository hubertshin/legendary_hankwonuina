import { Job, Processor } from "bullmq";
import openai, { PROMPTS } from "@/lib/openai";
import prisma from "@/lib/db";
import { workerLogger } from "@/lib/logger";
import type { WriteJobData } from "@/lib/queue";

interface Chapter {
  title: string;
  content: string;
  citations: string[];
  uncertainParts: string[];
}

interface DraftResponse {
  title: string;
  chapters: Chapter[];
  wordCount: number;
  summary: string;
}

export const writeProcessor: Processor<WriteJobData> = async (
  job: Job<WriteJobData>
) => {
  const { projectId, storyId } = job.data;

  workerLogger.info({ jobId: job.id, projectId }, "Starting draft writing");

  try {
    // Update job status
    await prisma.job.updateMany({
      where: { projectId, type: "WRITE", status: "PENDING" },
      data: { status: "PROCESSING", startedAt: new Date() },
    });

    await job.updateProgress(10);

    // Get story and transcripts
    const story = await prisma.extractedStory.findUnique({
      where: { id: storyId },
    });

    const transcripts = await prisma.transcript.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });

    if (!story) {
      throw new Error("Story not found");
    }

    const combinedTranscript = transcripts
      .map((t, i) => `[녹음 ${i + 1}]\n${t.text}`)
      .join("\n\n");

    await job.updateProgress(20);

    // Call OpenAI to write draft
    const prompt = PROMPTS.WRITE_DRAFT
      .replace("{{story}}", JSON.stringify(story.data, null, 2))
      .replace("{{transcript}}", combinedTranscript);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, literary Korean autobiography writer. Write in first person, with a nostalgic and heartfelt tone. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 8000,
    });

    await job.updateProgress(80);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const draftData: DraftResponse = JSON.parse(content);

    // Calculate metrics
    const totalContent = draftData.chapters.map((c) => c.content).join("\n\n");
    const wordCount = totalContent.replace(/\s+/g, "").length;
    const pageCount = draftData.chapters.length;

    // Deactivate old drafts
    await prisma.draft.updateMany({
      where: { projectId, isActive: true },
      data: { isActive: false },
    });

    // Get next version number
    const lastDraft = await prisma.draft.findFirst({
      where: { projectId },
      orderBy: { version: "desc" },
    });

    // Save draft
    const draft = await prisma.draft.create({
      data: {
        projectId,
        version: (lastDraft?.version || 0) + 1,
        title: draftData.title || "나의 자서전",
        chapters: draftData.chapters,
        content: totalContent,
        wordCount,
        pageCount,
        isActive: true,
      },
    });

    // Update job status
    await prisma.job.updateMany({
      where: { projectId, type: "WRITE" },
      data: { status: "COMPLETED", completedAt: new Date(), progress: 100 },
    });

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "COMPLETED" },
    });

    await job.updateProgress(100);

    workerLogger.info(
      { jobId: job.id, draftId: draft.id, pageCount, wordCount },
      "Draft writing complete"
    );

    return { draftId: draft.id };
  } catch (error) {
    workerLogger.error({ jobId: job.id, error }, "Draft writing failed");

    await prisma.job.updateMany({
      where: { projectId, type: "WRITE" },
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
