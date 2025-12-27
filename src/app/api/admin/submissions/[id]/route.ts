import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateSubmissionSchema } from "@/lib/validations";

/**
 * GET /api/admin/submissions/[id]
 * Get submission detail (ADMIN only)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Admin submission GET error:", error);

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/submissions/[id]
 * Update submission status/notes (ADMIN only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const body = await request.json();

    // Validate request
    const result = updateSubmissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { status, adminNotes } = result.data;

    // Update submission
    const submission = await prisma.submission.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Admin submission PATCH error:", error);

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}
