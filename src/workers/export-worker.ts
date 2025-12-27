import { Job, Processor } from "bullmq";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import prisma from "@/lib/db";
import { workerLogger } from "@/lib/logger";
import type { ExportJobData } from "@/lib/queue";

interface Chapter {
  title: string;
  content: string;
  citations?: string[];
  uncertainParts?: string[];
}

export const exportProcessor: Processor<ExportJobData> = async (
  job: Job<ExportJobData>
) => {
  const { projectId, draftId, format } = job.data;

  workerLogger.info({ jobId: job.id, format }, "Starting export");

  try {
    // Get draft
    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
      include: { project: true },
    });

    if (!draft) {
      throw new Error("Draft not found");
    }

    await job.updateProgress(20);

    const chapters = draft.chapters as Chapter[];

    if (format === "docx") {
      // Generate DOCX
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Title
              new Paragraph({
                text: draft.title,
                heading: HeadingLevel.TITLE,
                spacing: { after: 400 },
              }),
              // Chapters
              ...chapters.flatMap((chapter) => [
                new Paragraph({
                  text: chapter.title,
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 400, after: 200 },
                }),
                ...chapter.content.split("\n\n").map(
                  (para) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: para,
                          font: "Noto Serif KR",
                          size: 24,
                        }),
                      ],
                      spacing: { after: 200 },
                    })
                ),
              ]),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      await job.updateProgress(80);

      // Store result in job output
      await prisma.job.updateMany({
        where: { projectId, type: "EXPORT_DOCX" },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          output: {
            format: "docx",
            size: buffer.length,
            data: buffer.toString("base64"),
          },
        },
      });
    } else {
      // For PDF, we would typically use a library like puppeteer or react-pdf
      // For now, return a simple placeholder
      await prisma.job.updateMany({
        where: { projectId, type: "EXPORT_PDF" },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          output: {
            format: "pdf",
            message: "PDF export requires additional setup",
          },
        },
      });
    }

    await job.updateProgress(100);

    workerLogger.info({ jobId: job.id, format }, "Export complete");

    return { success: true };
  } catch (error) {
    workerLogger.error({ jobId: job.id, error }, "Export failed");

    await prisma.job.updateMany({
      where: { projectId, type: format === "pdf" ? "EXPORT_PDF" : "EXPORT_DOCX" },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
};
