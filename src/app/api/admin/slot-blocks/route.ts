import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { BOOKING } from "@/lib/booking/config";
import { dateKeyToInstant, formatKstClock, kstDateKey } from "@/lib/booking/kst";
import { candidateSlotStarts, slotCoveringInstant } from "@/lib/booking/slots";
import { buildTimetable, type BookedEntry } from "@/lib/booking/timetable";

/**
 * 상담 불가 시간 관리.
 *
 * GET  현재 시간표 (모든 칸의 상태)
 * POST 여러 칸을 한 번에 막거나 푼다
 *
 * 왜 한 번에 여러 칸인가
 * "그날 오후는 전부 안 됩니다" 같은 요구가 흔하다. 칸마다 요청을 보내면
 * 일부만 반영된 채 실패할 수 있고, 화면과 DB가 어긋난다.
 */

const rangeSchema = z.object({
  /** 시작 날짜 "YYYY-MM-DD" (KST). 없으면 오늘 */
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  /** 보여줄 날 수 */
  days: z.coerce.number().int().min(1).max(31).default(7),
});

const mutateSchema = z.object({
  action: z.enum(["block", "unblock"]),
  /** 대상 슬롯 시작 시각 (ISO). 한 번에 최대 하루치 넉넉히 */
  startAts: z.array(z.string().datetime()).min(1).max(200),
  reason: z.string().trim().max(200).optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const parsed = rangeSchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "잘못된 조회 범위입니다." }, { status: 400 });
    }

    const now = new Date();
    const fromDateKey = parsed.data.from ?? kstDateKey(now);
    const dayCount = parsed.data.days;

    const rangeStart = dateKeyToInstant(fromDateKey);
    if (!rangeStart) {
      return NextResponse.json({ error: "잘못된 날짜입니다." }, { status: 400 });
    }
    const rangeEnd = new Date(rangeStart.getTime() + dayCount * 86_400_000);

    const [booked, blocks] = await Promise.all([
      prisma.submission.findMany({
        where: {
          preferredSlotAt: { gte: rangeStart, lt: rangeEnd },
          status: { in: ["PENDING", "CONTACTED"] },
        },
        select: { preferredSlotAt: true, name: true },
      }),
      prisma.slotBlock.findMany({
        where: { startAt: { gte: rangeStart, lt: rangeEnd } },
        select: { startAt: true, reason: true },
      }),
    ]);

    // 예약을 '그 시각을 품는 칸'에 넣는다.
    //
    // 슬롯 길이를 30분에서 1시간으로 바꾸기 전에 잡힌 14:30 예약은 어느 칸과도
    // 시각이 일치하지 않는다. 시각으로만 맞추면 그 예약이 표에서 사라지고,
    // 운영자는 그 시간이 비어 있는 줄 알고 막아버린다.
    const bookedBySlot = new Map<number, BookedEntry[]>();
    for (const row of booked) {
      if (!row.preferredSlotAt) continue;
      const cellStart = slotCoveringInstant(row.preferredSlotAt);
      if (!cellStart) continue; // 운영 시간 밖으로 밀려난 예약은 표에 자리가 없다
      const key = cellStart.getTime();
      const entry: BookedEntry = {
        name: row.name,
        clock: formatKstClock(row.preferredSlotAt),
      };
      bookedBySlot.set(key, [...(bookedBySlot.get(key) ?? []), entry]);
    }

    const blockedBySlot = new Map<number, string | null>(
      blocks.map((b) => [b.startAt.getTime(), b.reason])
    );

    const timetable = buildTimetable({
      now,
      fromDateKey,
      dayCount,
      bookedBySlot,
      blockedBySlot,
    });

    return NextResponse.json({
      ...timetable,
      fromDateKey,
      dayCount,
      todayKey: kstDateKey(now),
      maxAdvanceDays: BOOKING.maxAdvanceDays,
    });
  } catch (error) {
    return handleError(error, "[admin/slot-blocks] 조회 실패");
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => null);
    const parsed = mutateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "요청 형식이 올바르지 않습니다.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { action, startAts, reason } = parsed.data;
    const targets = startAts.map((iso) => new Date(iso));

    if (targets.some((d) => Number.isNaN(d.getTime()))) {
      return NextResponse.json({ error: "잘못된 시각입니다." }, { status: 400 });
    }

    if (action === "unblock") {
      const { count } = await prisma.slotBlock.deleteMany({
        where: { startAt: { in: targets } },
      });
      console.log(`[admin] 상담 불가 시간 해제: ${count}건`);
      return NextResponse.json({ ok: true, changed: count });
    }

    // 규칙상 존재하지 않는 시각은 막을 이유가 없다.
    // 임의 시각이 쌓이면 시간표에 보이지도 않는 유령 행이 남는다.
    const valid = targets.filter((start) =>
      candidateSlotStarts(kstDateKey(start)).some((c) => c.getTime() === start.getTime())
    );
    if (valid.length === 0) {
      return NextResponse.json(
        { error: "운영 시간에 없는 시각입니다." },
        { status: 400 }
      );
    }

    // 이미 예약이 잡힌 칸은 막지 않는다.
    //
    // 막아도 그 예약이 사라지지는 않는다. 오히려 시간표에서 예약이 가려져
    // 운영자가 통화 약속을 놓칠 수 있다. 예약을 정리하는 것이 먼저다.
    //
    // 시각이 정확히 같은지가 아니라 **칸 구간에 들어오는지**로 본다.
    // 14:00 칸을 막을 때 14:30에 잡힌 옛 예약도 걸러내야 한다.
    const span = BOOKING.slotMinutes * 60_000;
    const windowStart = new Date(Math.min(...valid.map((d) => d.getTime())));
    const windowEnd = new Date(Math.max(...valid.map((d) => d.getTime())) + span);

    const conflicts = await prisma.submission.findMany({
      where: {
        preferredSlotAt: { gte: windowStart, lt: windowEnd },
        status: { in: ["PENDING", "CONTACTED"] },
      },
      select: { preferredSlotAt: true },
    });
    const conflictKeys = new Set(
      conflicts
        .map((c) => slotCoveringInstant(c.preferredSlotAt as Date))
        .filter((d): d is Date => d !== null)
        .map((d) => d.getTime())
    );
    const blockable = valid.filter((d) => !conflictKeys.has(d.getTime()));

    if (blockable.length === 0) {
      return NextResponse.json(
        { error: "선택한 시간에 이미 예약이 있어 막을 수 없습니다." },
        { status: 409 }
      );
    }

    // skipDuplicates로 이미 막힌 칸을 조용히 넘긴다.
    // 두 탭에서 같은 칸을 눌러도 오류가 나면 안 된다.
    const { count } = await prisma.slotBlock.createMany({
      data: blockable.map((startAt) => ({ startAt, reason: reason || null })),
      skipDuplicates: true,
    });

    console.log(`[admin] 상담 불가 시간 등록: ${count}건`);
    return NextResponse.json({
      ok: true,
      changed: count,
      skippedBooked: conflictKeys.size,
    });
  } catch (error) {
    return handleError(error, "[admin/slot-blocks] 변경 실패");
  }
}

function handleError(error: unknown, label: string) {
  if (error instanceof Error && error.message === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.error(label, error);
  return NextResponse.json({ error: "처리 중 오류가 발생했습니다." }, { status: 500 });
}

export const dynamic = "force-dynamic";
