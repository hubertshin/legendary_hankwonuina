/**
 * KST(Asia/Seoul) 시각 처리.
 *
 * 서버가 어느 타임존에서 돌든 예약 시간 계산이 흔들리면 안 된다. 한국은
 * UTC+9 고정이고 DST가 없으므로 오프셋을 상수로 다루는 것이 가장 안전하다.
 *
 * 저장은 항상 UTC, 표시·판정은 항상 KST 벽시계 기준이다.
 */

export const KST_OFFSET_MINUTES = 9 * 60;

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export interface KstParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0=일 … 6=토
}

export function toKstParts(instant: Date): KstParts {
  const shifted = new Date(instant.getTime() + KST_OFFSET_MINUTES * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(),
  };
}

export function kstToInstant(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - KST_OFFSET_MINUTES * 60_000);
}

/** "YYYY-MM-DD" (KST 기준) */
export function kstDateKey(instant: Date): string {
  const { year, month, day } = toKstParts(instant);
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** "YYYY-MM-DD" → KST 자정 순간. 형식이 틀리거나 없는 날짜면 null. */
export function dateKeyToInstant(dateKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const instant = kstToInstant(Number(y), Number(m), Number(d));
  const parts = toKstParts(instant);
  // 2026-02-31 같은 값이 굴러 들어가는 것을 막는다
  if (parts.year !== Number(y) || parts.month !== Number(m) || parts.day !== Number(d)) {
    return null;
  }
  return instant;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const base = dateKeyToInstant(dateKey);
  if (!base) throw new Error(`잘못된 날짜: ${dateKey}`);
  return kstDateKey(new Date(base.getTime() + days * 86_400_000));
}

export function weekdayLabel(instant: Date): string {
  return WEEKDAY_LABELS[toKstParts(instant).weekday];
}

/** "8월 18일 (화) 오후 3시" */
export function formatKstLong(instant: Date): string {
  const { month, day } = toKstParts(instant);
  return `${month}월 ${day}일 (${weekdayLabel(instant)}) ${formatKstTime(instant)}`;
}

/** "오후 3시" / "오후 3시 30분" — 시니어 가독성을 위해 24시간제를 쓰지 않는다 */
export function formatKstTime(instant: Date): string {
  const { hour, minute } = toKstParts(instant);
  const meridiem = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0
    ? `${meridiem} ${displayHour}시`
    : `${meridiem} ${displayHour}시 ${minute}분`;
}

/** "14:00" — 슬롯 버튼용 */
export function formatKstClock(instant: Date): string {
  const { hour, minute } = toKstParts(instant);
  return `${pad(hour)}:${pad(minute)}`;
}

export function parseClockToMinutes(clock: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(clock);
  if (!match) throw new Error(`잘못된 시각 형식: ${clock}`);
  return Number(match[1]) * 60 + Number(match[2]);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
