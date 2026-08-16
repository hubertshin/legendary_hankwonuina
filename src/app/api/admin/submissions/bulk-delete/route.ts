import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { bulkDeleteSchema } from "@/lib/validations";

/**
 * POST /api/admin/submissions/bulk-delete
 *
 * 목록에서 선택한 여러 건을 한 번에 삭제한다.
 *
 * DELETE 메서드에 본문을 싣는 방식은 프록시·클라이언트에 따라 본문이 유실될
 * 수 있어 POST로 받는다. 삭제 대상은 요청 본문의 id 배열로만 정해지므로
 * 조건 삭제(예: 전체 삭제)는 애초에 불가능하다.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const result = bulkDeleteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "삭제할 항목을 선택해주세요.", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { ids } = result.data;
    const { count } = await prisma.submission.deleteMany({
      where: { id: { in: ids } },
    });

    console.log(`[admin] 신청 일괄 삭제: ${count}건`);
    return NextResponse.json({ ok: true, deleted: count });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin bulk delete error:", error);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }
}
