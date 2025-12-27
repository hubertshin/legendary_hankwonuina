import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { createProjectSchema } from "@/lib/validations";
import { apiLogger } from "@/lib/logger";

// GET /api/projects - List user's projects
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        audioAssets: true,
        drafts: {
          where: { isActive: true },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    apiLogger.error({ error }, "Failed to list projects");
    return NextResponse.json(
      { error: "Failed to list projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        title: data.title || "나의 자서전",
      },
    });

    apiLogger.info({ projectId: project.id }, "Project created");

    return NextResponse.json(project);
  } catch (error) {
    apiLogger.error({ error }, "Failed to create project");
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
