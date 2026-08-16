/**
 * 예약 가능 슬롯 생성.
 *
 * 슬롯을 DB에 미리 만들어두지 않고 **운영 규칙에서 결정적으로 생성**한다.
 * 미리 만들면 운영 시간을 바꿀 때마다 마이그레이션이 필요하고, 아직 아무도
 * 예약하지 않은 빈 행이 쌓인다. 실제로 저장하는 것은 "신청"뿐이다.
 *
 * 네트워크·DB를 모르는 순수 함수라 단위 테스트가 쉽다.
 */

import { BOOKING, TIME_GROUPS } from "./config";
import { isHoliday } from "./holidays";
import {
  addDaysToDateKey,
  dateKeyToInstant,
  formatKstClock,
  formatKstTime,
  kstDateKey,
  parseClockToMinutes,
  toKstParts,
  weekdayLabel,
} from "./kst";

export interface SlotView {
  /** ISO UTC */
  startAt: string;
  /** "14:00" */
  clock: string;
  /** "오후 2시" */
  label: string;
  groupId: string;
  remaining: number;
}

export interface DayView {
  dateKey: string;
  dayLabel: string;
  weekdayLabel: string;
  relativeLabel?: string;
  isClosed: boolean;
  totalRemaining: number;
  groups: { id: string; label: string; slots: SlotView[] }[];
}

/** 이미 슬롯을 점유한 예약 (Submission에서 뽑아 넘긴다) */
export interface OccupiedSlot {
  startAt: string; // ISO UTC
}

export interface SlotContext {
  now: Date;
  occupied: OccupiedSlot[];
  /**
   * 운영자가 막아둔 슬롯 시작 시각 (ISO UTC).
   *
   * 운영 시간 안이지만 그날 그 시각만 비워야 할 때 쓴다(외부 일정, 휴가 등).
   * 넘기지 않으면 아무것도 막지 않는다 — 기존 호출부를 깨지 않기 위해서다.
   */
  blocked?: string[];
}

/**
 * 해당 날짜의 슬롯 시작 시각 목록 (가용성 판단 전).
 *
 * 슬롯은 운영 종료 시각까지 **완전히 끝나야** 한다. 18:40에 시작해 19:10에
 * 끝나는 슬롯을 만들면 상담사가 초과 근무한다.
 */
export function candidateSlotStarts(dateKey: string): Date[] {
  const dayStart = dateKeyToInstant(dateKey);
  if (!dayStart) return [];
  if (isHoliday(dateKey)) return [];

  const { weekday } = toKstParts(dayStart);
  const window = BOOKING.windowsByWeekday[weekday];
  if (!window) return [];

  const open = parseClockToMinutes(window.start);
  const close = parseClockToMinutes(window.end);
  const lunchStart = parseClockToMinutes(BOOKING.lunchBreak.start);
  const lunchEnd = parseClockToMinutes(BOOKING.lunchBreak.end);
  const length = BOOKING.slotMinutes;

  const starts: Date[] = [];
  for (let minute = open; minute + length <= close; minute += length) {
    // 점심시간과 조금이라도 겹치면 제외한다
    if (minute < lunchEnd && minute + length > lunchStart) continue;
    starts.push(new Date(dayStart.getTime() + minute * 60_000));
  }
  return starts;
}

/** 운영자가 막아둔 슬롯인가 */
export function isBlocked(slotStart: Date, blocked: string[] | undefined): boolean {
  if (!blocked || blocked.length === 0) return false;
  const target = slotStart.getTime();
  return blocked.some((iso) => new Date(iso).getTime() === target);
}

function bookedCount(slotStart: Date, occupied: OccupiedSlot[]): number {
  const target = slotStart.toISOString();
  return occupied.filter((o) => o.startAt === target).length;
}

function groupIdFor(slotStart: Date): string {
  const { hour } = toKstParts(slotStart);
  return TIME_GROUPS.find((g) => hour >= g.fromHour && hour < g.toHour)?.id ?? "afternoon";
}

/** 리드타임과 예약 가능 범위 판정 */
export function isWithinBookableRange(slotStart: Date, now: Date): boolean {
  const earliest = now.getTime() + BOOKING.minLeadHours * 3_600_000;
  if (slotStart.getTime() < earliest) return false;

  const lastKey = addDaysToDateKey(kstDateKey(now), BOOKING.maxAdvanceDays);
  const lastInstant = dateKeyToInstant(lastKey);
  if (!lastInstant) return false;
  return slotStart.getTime() < lastInstant.getTime() + 86_400_000;
}

/**
 * 슬롯을 쓸 수 없는 이유. 쓸 수 있으면 null.
 *
 * 단일 불리언으로 두면 잘못된 시각을 보냈는데도 "마감됐습니다"라고 답하게 된다.
 */
export type SlotUnavailableReason =
  | "not_a_slot"
  | "too_soon"
  | "out_of_range"
  | "full"
  | "blocked";

export function slotUnavailableReason(
  slotStart: Date,
  ctx: SlotContext
): SlotUnavailableReason | null {
  const dateKey = kstDateKey(slotStart);

  // 규칙상 존재하는 슬롯인지 (임의 시각 주입 차단)
  const exists = candidateSlotStarts(dateKey).some(
    (candidate) => candidate.getTime() === slotStart.getTime()
  );
  if (!exists) return "not_a_slot";

  if (slotStart.getTime() < ctx.now.getTime() + BOOKING.minLeadHours * 3_600_000) {
    return "too_soon";
  }
  if (!isWithinBookableRange(slotStart, ctx.now)) return "out_of_range";

  // 차단은 정원보다 먼저 본다.
  // 막아둔 시간은 자리가 비어 있든 아니든 예약을 받지 않는다는 뜻이다.
  if (isBlocked(slotStart, ctx.blocked)) return "blocked";

  if (bookedCount(slotStart, ctx.occupied) >= BOOKING.capacityPerSlot) return "full";

  return null;
}

export function isSlotBookable(slotStart: Date, ctx: SlotContext): boolean {
  return slotUnavailableReason(slotStart, ctx) === null;
}

/**
 * 예약 화면에 내려줄 날짜별 슬롯 목록.
 *
 * 마감된 슬롯은 **포함하지 않는다**. 회색 비활성 표시보다 숨기는 편이
 * 시니어 UX에서 혼란이 적다.
 */
export function buildDayViews(ctx: SlotContext): DayView[] {
  const todayKey = kstDateKey(ctx.now);
  const days: DayView[] = [];

  for (let offset = 0; offset <= BOOKING.maxAdvanceDays; offset += 1) {
    const dateKey = addDaysToDateKey(todayKey, offset);
    const dayInstant = dateKeyToInstant(dateKey);
    if (!dayInstant) continue;

    const candidates = candidateSlotStarts(dateKey);
    const available: SlotView[] = candidates
      .filter((start) => isSlotBookable(start, ctx))
      .map((start) => ({
        startAt: start.toISOString(),
        clock: formatKstClock(start),
        label: formatKstTime(start),
        groupId: groupIdFor(start),
        remaining: BOOKING.capacityPerSlot - bookedCount(start, ctx.occupied),
      }));

    const groups = TIME_GROUPS.map((group) => ({
      id: group.id,
      label: group.label,
      slots: available.filter((slot) => slot.groupId === group.id),
    })).filter((group) => group.slots.length > 0);

    days.push({
      dateKey,
      dayLabel: String(toKstParts(dayInstant).day),
      weekdayLabel: weekdayLabel(dayInstant),
      relativeLabel: offset === 0 ? "오늘" : offset === 1 ? "내일" : undefined,
      isClosed: candidates.length === 0,
      totalRemaining: available.length,
      groups,
    });
  }

  return days;
}
