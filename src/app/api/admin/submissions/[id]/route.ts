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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const { id } = await params;

    const submission = await prisma.submission.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
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

    const { status, adminNotes, callResult } = result.data;

    const { id } = await params;

    // 통화 결과에 따라 상태를 함께 전이시킨다. 둘을 따로 관리하면 어긋난다.
    //   연결됨   → 연락완료
    //   부재/재통화 희망 → 아직 연락이 닿지 않았으므로 신규로 남긴다
    //   해제(null) → 신규로 되돌린다
    const derivedStatus =
      callResult === undefined
        ? undefined
        : callResult === "CONNECTED"
          ? "CONTACTED"
          : "PENDING";

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(!status && derivedStatus ? { status: derivedStatus } : {}),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(callResult !== undefined && {
          callResult,
          // 결과를 지우면 통화 시각도 함께 지운다 — "언제 걸었는지"만 남으면 오해를 부른다
          calledAt: callResult === null ? null : new Date(),
        }),
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


/**
 * DELETE /api/admin/submissions/[id]
 *
 * 신청 1건을 삭제한다. 개인정보(성함·연락처)가 담긴 레코드이므로 파기 수단이
 * 필요하다. 되돌릴 수 없으므로 화면에서 반드시 확인을 받아야 한다.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.submission.delete({ where: { id } });

    console.log(`[admin] 신청 삭제: ${id}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 이미 지워진 건을 다시 지우려는 경우
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "이미 삭제된 항목입니다." }, { status: 404 });
    }
    console.error("Admin submission DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
  }
}
