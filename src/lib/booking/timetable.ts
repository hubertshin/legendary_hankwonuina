/**
 * 운영자용 시간표.
 *
 * 고객 화면(buildDayViews)은 **예약 가능한 시간만** 내려준다. 마감·차단된
 * 슬롯은 아예 보이지 않는 편이 시니어 UX에서 혼란이 적기 때문이다.
 *
 * 그런데 운영자 화면은 정반대가 필요하다. 막으려면 먼저 **막을 수 있는
 * 칸이 보여야** 한다. 그래서 같은 규칙에서 출발하되 모든 칸을 상태와 함께
 * 내려주는 별도의 뷰를 만든다.
 */

import { BOOKING } from "./config";
import { holidayName } from "./holidays";
import {
  addDaysToDateKey,
  dateKeyToInstant,
  formatKstClock,
  kstDateKey,
  toKstParts,
  weekdayLabel,
} from "./kst";
import { candidateSlotStarts } from "./slots";

/**
 * 한 칸의 상태.
 *
 * - `open`    예약을 받는 중. 누르면 막을 수 있다
 * - `blocked` 운영자가 막아둠. 누르면 풀 수 있다
 * - `booked`  이미 예약이 잡힘. 막을 수 없다
 * - `past`    지났거나 최소 예약 여유(minLeadHours) 안쪽이라 어차피 못 받는다
 * - `closed`  운영 시간이 아니다 (주말·공휴일·영업 외 시각)
 */
export type CellState = "open" | "blocked" | "booked" | "past" | "closed";

export interface TimetableCell {
  /** 슬롯 시작 시각 (ISO UTC). closed면 null */
  startAt: string | null;
  state: CellState;
  /** booked일 때 신청자 이름 (동명이인 대비로 여러 명일 수 있다) */
  bookedNames?: string[];
  /** blocked일 때 남긴 메모 */
  reason?: string | null;
}

export interface TimetableDay {
  dateKey: string;
  /** "16" */
  dayLabel: string;
  /** "일" */
  weekdayLabel: string;
  /** "오늘" / "내일" */
  relativeLabel?: string;
  /** 주말·공휴일 등 아예 운영하지 않는 날 */
  isClosed: boolean;
  /** "광복절" 같은 공휴일 이름 */
  holidayName?: string;
  /** 이 날에서 지금 막을 수 있는 칸 수 (열림 상태) */
  openCount: number;
  /** 이 날에서 막혀 있는 칸 수 */
  blockedCount: number;
}

export interface Timetable {
  days: TimetableDay[];
  /** 행 머리글. "14:00" … "18:30" */
  times: string[];
  /** cells[dateKey][clock] */
  cells: Record<string, Record<string, TimetableCell>>;
}

export interface TimetableInput {
  now: Date;
  /** 시작 날짜 "YYYY-MM-DD" (KST) */
  fromDateKey: string;
  /** 보여줄 날 수 */
  dayCount: number;
  /** 예약이 잡힌 슬롯: 시작 시각 → 신청자 이름들 */
  bookedBySlot: Map<number, string[]>;
  /** 차단된 슬롯: 시작 시각 → 사유 */
  blockedBySlot: Map<number, string | null>;
}

export function buildTimetable(input: TimetableInput): Timetable {
  const { now, fromDateKey, dayCount, bookedBySlot, blockedBySlot } = input;
  const todayKey = kstDateKey(now);
  const leadCutoff = now.getTime() + BOOKING.minLeadHours * 3_600_000;

  const days: TimetableDay[] = [];
  const cells: Record<string, Record<string, TimetableCell>> = {};
  const timeSet = new Set<string>();

  for (let offset = 0; offset < dayCount; offset += 1) {
    const dateKey = addDaysToDateKey(fromDateKey, offset);
    const dayInstant = dateKeyToInstant(dateKey);
    if (!dayInstant) continue;

    const candidates = candidateSlotStarts(dateKey);
    const row: Record<string, TimetableCell> = {};
    let openCount = 0;
    let blockedCount = 0;

    for (const start of candidates) {
      const clock = formatKstClock(start);
      timeSet.add(clock);

      const key = start.getTime();
      const names = bookedBySlot.get(key);
      let cell: TimetableCell;

      // 순서가 중요하다.
      //
      // 예약이 잡힌 칸은 지난 시간이라도 "예약"으로 보여야 한다. 운영자가
      // 오늘 누구와 통화하기로 했는지 확인하는 화면이기도 하기 때문이다.
      if (names && names.length > 0) {
        cell = { startAt: start.toISOString(), state: "booked", bookedNames: names };
      } else if (blockedBySlot.has(key)) {
        cell = {
          startAt: start.toISOString(),
          state: "blocked",
          reason: blockedBySlot.get(key) ?? null,
        };
        blockedCount += 1;
      } else if (key < leadCutoff) {
        // 어차피 고객이 고를 수 없는 칸이다. 막는 의미가 없으니 비활성으로 둔다.
        cell = { startAt: start.toISOString(), state: "past" };
      } else {
        cell = { startAt: start.toISOString(), state: "open" };
        openCount += 1;
      }

      row[clock] = cell;
    }

    cells[dateKey] = row;

    const offsetFromToday = daysBetween(todayKey, dateKey);
    days.push({
      dateKey,
      dayLabel: String(toKstParts(dayInstant).day),
      weekdayLabel: weekdayLabel(dayInstant),
      relativeLabel:
        offsetFromToday === 0 ? "오늘" : offsetFromToday === 1 ? "내일" : undefined,
      isClosed: candidates.length === 0,
      holidayName: holidayName(dateKey) ?? undefined,
      openCount,
      blockedCount,
    });
  }

  // 운영하지 않는 날만 조회하면 시간 축이 비어 표가 아예 그려지지 않는다.
  // 그때는 평일 규칙으로 축을 만들어 빈 표라도 형태를 유지한다.
  const times =
    timeSet.size > 0 ? [...timeSet].sort() : fallbackTimes();

  // 운영하지 않는 날의 칸을 closed로 채운다. 표는 직사각형이어야 읽힌다.
  for (const day of days) {
    const row = cells[day.dateKey] ?? {};
    for (const clock of times) {
      if (!row[clock]) row[clock] = { startAt: null, state: "closed" };
    }
    cells[day.dateKey] = row;
  }

  return { days, times, cells };
}

/** 두 날짜 키 사이의 일수 (KST 자정 기준) */
function daysBetween(fromKey: string, toKey: string): number {
  const from = dateKeyToInstant(fromKey);
  const to = dateKeyToInstant(toKey);
  if (!from || !to) return Number.NaN;
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/** 조회 범위가 전부 휴무일 때 쓰는 시간 축 */
function fallbackTimes(): string[] {
  for (let weekday = 1; weekday <= 5; weekday += 1) {
    const window = BOOKING.windowsByWeekday[weekday];
    if (!window) continue;
    const times: string[] = [];
    const [startH, startM] = window.start.split(":").map(Number);
    const [endH, endM] = window.end.split(":").map(Number);
    for (
      let minutes = startH * 60 + startM;
      minutes + BOOKING.slotMinutes <= endH * 60 + endM;
      minutes += BOOKING.slotMinutes
    ) {
      times.push(
        `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
      );
    }
    return times;
  }
  return [];
}
