import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { notifyNewBooking } from "@/lib/notify";

/**
 * POST /api/admin/submissions/resend-notification
 *
 * 발송에 실패한 알림을 다시 보낸다.
 *
 * 실패를 표시만 하고 재발송 수단이 없으면 반쪽이다. 실제로 API 키가 무효화된
 * 동안 신청 두 건의 알림이 유실됐는데, 키를 고친 뒤 그 건들을 다시 보낼 방법이
 * 없었다.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ error: "신청 ID가 필요합니다." }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({ where: { id } });
    if (!submission) {
      return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });
    }

    const results = await notifyNewBooking({
      submissionId: submission.id,
      name: submission.name,
      phone: submission.phone,
      subjectType: submission.subjectType,
      subjectName: submission.subjectOther,
      subjectAgeRange: null,
      question: null,
      preferredSlotAt: submission.preferredSlotAt
        ? submission.preferredSlotAt.toISOString()
        : null,
      anyTimeOk: submission.anyTimeOk,
      createdAt: submission.createdAt.toISOString(),
    });

    const sent = results.some((r) => r.ok);
    const reason = results.find((r) => !r.ok)?.reason;

    await prisma.submission.update({
      where: { id },
      data: {
        notifiedAt: sent ? new Date() : null,
        notifyError: sent ? null : (reason ?? "unknown").slice(0, 500),
      },
    });

    if (!sent) {
      return NextResponse.json(
        { error: `발송 실패: ${reason ?? "원인 불명"}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin resend-notification error:", error);
    return NextResponse.json({ error: "재발송에 실패했습니다." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
