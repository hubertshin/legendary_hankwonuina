import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BOOKING } from "@/lib/booking/config";
import { buildDayViews } from "@/lib/booking/slots";
import { READ_RULE, checkOptional, clientKey } from "@/lib/booking/ratelimit";

/**
 * 예약 가능 시간 조회.
 *
 * 이미 잡힌 슬롯은 Submission에서 읽어 정원 계산에 반영한다. 마감된 슬롯은
 * 응답에 포함하지 않으므로 클라이언트가 별도로 거를 필요가 없다.
 */
export async function GET(request: Request) {
  const limit = checkOptional(clientKey(request, "slots"), READ_RULE);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const now = new Date();

    // 과거 예약까지 볼 필요는 없다. 조회 범위 안의 것만 가져온다.
    const horizon = new Date(now.getTime() + (BOOKING.maxAdvanceDays + 1) * 86_400_000);
    const taken = await prisma.submission.findMany({
      where: {
        preferredSlotAt: { gte: now, lte: horizon },
        status: { in: ["PENDING", "CONTACTED"] },
      },
      select: { preferredSlotAt: true },
    });

    const days = buildDayViews({
      now,
      occupied: taken
        .filter((t) => t.preferredSlotAt !== null)
        .map((t) => ({ startAt: (t.preferredSlotAt as Date).toISOString() })),
    });

    return NextResponse.json({
      days,
      lowRemainingThreshold: BOOKING.lowRemainingThreshold,
    });
  } catch (error) {
    console.error("[event/slots] 조회 실패", error);
    return NextResponse.json(
      { error: "예약 가능 시간을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
