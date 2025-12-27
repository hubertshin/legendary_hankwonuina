import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import openai, { PROMPTS } from "@/lib/openai";
import { regenerateSectionSchema } from "@/lib/validations";
import { apiLogger } from "@/lib/logger";

interface Chapter {
  title: string;
  content: string;
  citations?: string[];
  uncertainParts?: string[];
}

// POST /api/drafts/regenerate - Regenerate a section of the draft
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { draftId, chapterIndex, feedback } =
      regenerateSectionSchema.parse(body);

    // Get draft and verify ownership
    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
      include: {
        project: {
          include: {
            transcripts: true,
            story: true,
          },
        },
      },
    });

    if (!draft || draft.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const chapters = draft.chapters as Chapter[];
    const chapter = chapters[chapterIndex];

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Get context
    const transcriptText = draft.project.transcripts
      .map((t) => t.text)
      .join("\n\n");

    // Regenerate section
    const prompt = PROMPTS.REGENERATE_SECTION
      .replace("{{section}}", JSON.stringify(chapter))
      .replace("{{feedback}}", feedback)
      .replace(
        "{{context}}",
        JSON.stringify({
          story: draft.project.story?.data,
          transcript: transcriptText.substring(0, 3000),
        })
      );

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, literary Korean autobiography writer. Regenerate the section based on feedback. Return JSON with title and content fields.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const newChapter = JSON.parse(content);

    // Update chapter
    chapters[chapterIndex] = {
      ...chapter,
      ...newChapter,
    };

    // Calculate new content
    const totalContent = chapters.map((c) => c.content).join("\n\n");
    const wordCount = totalContent.replace(/\s+/g, "").length;

    // Update draft
    await prisma.draft.update({
      where: { id: draftId },
      data: {
        chapters,
        content: totalContent,
        wordCount,
      },
    });

    apiLogger.info(
      { draftId, chapterIndex },
      "Section regenerated successfully"
    );

    return NextResponse.json({ success: true, chapter: newChapter });
  } catch (error) {
    apiLogger.error({ error }, "Regeneration failed");
    return NextResponse.json(
      { error: "Regeneration failed" },
      { status: 500 }
    );
  }
}
