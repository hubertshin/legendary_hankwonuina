import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { exportRequestSchema } from "@/lib/validations";
import { apiLogger } from "@/lib/logger";

interface Chapter {
  title: string;
  content: string;
}

// POST /api/export - Export draft to PDF or DOCX
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, format } = exportRequestSchema.parse(body);

    // Verify ownership and payment
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        drafts: {
          where: { isActive: true },
          take: 1,
        },
        payment: true,
      },
    });

    if (!project || project.userId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check payment status (skip for now - feature flag)
    // if (project.payment?.status !== "COMPLETED") {
    //   return NextResponse.json({ error: "Payment required" }, { status: 402 });
    // }

    const draft = project.drafts[0];
    if (!draft) {
      return NextResponse.json({ error: "No draft found" }, { status: 404 });
    }

    const chapters = draft.chapters as unknown as Chapter[];

    if (format === "docx") {
      // Generate DOCX
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: draft.title,
                heading: HeadingLevel.TITLE,
                spacing: { after: 400 },
              }),
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

      apiLogger.info({ projectId, format }, "DOCX exported");

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(draft.title)}.docx"`,
        },
      });
    } else if (format === "pdf") {
      // For PDF, generate HTML that can be converted
      const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${draft.title}</title>
  <style>
    body { font-family: 'Noto Serif KR', Georgia, serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { font-size: 28px; margin-bottom: 40px; text-align: center; }
    h2 { font-size: 20px; margin-top: 40px; margin-bottom: 20px; }
    p { margin-bottom: 16px; text-indent: 2em; }
    .citation { color: #888; font-size: 12px; }
    .uncertain { background: #fffacd; padding: 2px 4px; }
  </style>
</head>
<body>
  <h1>${draft.title}</h1>
  ${chapters
    .map(
      (chapter) => `
    <h2>${chapter.title}</h2>
    ${chapter.content
      .split("\n\n")
      .map((para) => `<p>${para}</p>`)
      .join("")}
  `
    )
    .join("")}
</body>
</html>`;

      apiLogger.info({ projectId, format }, "PDF HTML generated");

      // Return HTML for now (client can print to PDF)
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    apiLogger.error({ error }, "Export failed");
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
