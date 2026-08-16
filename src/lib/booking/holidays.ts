/**
 * 대한민국 법정공휴일.
 *
 * 공휴일에 예약이 열리면 그 날 고객에게 전화를 걸게 된다. 실제로 2026-08-17
 * (광복절 대체공휴일)에 예약이 열려 있었다.
 *
 * 두 부분으로 나눈다.
 *   1. 양력 고정 공휴일 — 매년 같으므로 규칙으로 둔다
 *   2. 음력 기반 공휴일 — 매년 날짜가 달라 **데이터로 관리**한다
 *
 * 대체공휴일은 계산한다. 손으로 넣으면 매년 빠뜨린다.
 */

/** 양력 고정 공휴일. `substitute`는 대체공휴일 적용 대상 여부. */
const SOLAR_HOLIDAYS: { month: number; day: number; name: string; substitute: boolean }[] = [
  { month: 1, day: 1, name: "신정", substitute: false },
  { month: 3, day: 1, name: "삼일절", substitute: true },
  { month: 5, day: 5, name: "어린이날", substitute: true },
  // 현충일은 국가추모일이라 토·일과 겹쳐도 대체공휴일이 없다.
  { month: 6, day: 6, name: "현충일", substitute: false },
  { month: 8, day: 15, name: "광복절", substitute: true },
  { month: 10, day: 3, name: "개천절", substitute: true },
  { month: 10, day: 9, name: "한글날", substitute: true },
  { month: 12, day: 25, name: "기독탄신일", substitute: true },
];

/**
 * 음력 기반 공휴일 — 연도별 데이터.
 *
 * ⚠️ **매년 추가해야 한다.** 마지막 등록 연도를 넘어가면 설날·추석에 예약이
 * 열린다. `assertHolidaysConfigured()`가 이를 감지해 경고한다.
 *
 * 설날·추석은 연휴 3일을 모두 적는다(전날·당일·다음날).
 */
const LUNAR_HOLIDAYS: Record<number, { date: string; name: string; substituteOnSunday: boolean }[]> = {
  2026: [
    { date: "2026-02-16", name: "설날 연휴", substituteOnSunday: true },
    { date: "2026-02-17", name: "설날", substituteOnSunday: true },
    { date: "2026-02-18", name: "설날 연휴", substituteOnSunday: true },
    { date: "2026-05-24", name: "부처님오신날", substituteOnSunday: false }, // 토·일 모두 대체 대상
    { date: "2026-09-24", name: "추석 연휴", substituteOnSunday: true },
    { date: "2026-09-25", name: "추석", substituteOnSunday: true },
    { date: "2026-09-26", name: "추석 연휴", substituteOnSunday: true },
  ],
  2027: [
    { date: "2027-02-06", name: "설날 연휴", substituteOnSunday: true },
    { date: "2027-02-07", name: "설날", substituteOnSunday: true },
    { date: "2027-02-08", name: "설날 연휴", substituteOnSunday: true },
    { date: "2027-05-13", name: "부처님오신날", substituteOnSunday: false },
    { date: "2027-09-14", name: "추석 연휴", substituteOnSunday: true },
    { date: "2027-09-15", name: "추석", substituteOnSunday: true },
    { date: "2027-09-16", name: "추석 연휴", substituteOnSunday: true },
  ],
};

/** 음력 공휴일이 등록된 마지막 연도 */
export const LAST_CONFIGURED_YEAR = Math.max(...Object.keys(LUNAR_HOLIDAYS).map(Number));

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * "YYYY-MM-DD"의 요일 (0=일 … 6=토).
 *
 * KST 정오를 기준점으로 삼는다. 자정을 쓰면 타임존 변환에서 하루가 밀릴 수
 * 있는데, 정오는 어느 방향으로도 12시간 여유가 있어 안전하다.
 */
function weekdayOf(dateKey: string): number {
  return new Date(`${dateKey}T12:00:00+09:00`).getUTCDay();
}

function addDays(dateKey: string, days: number): string {
  const next = new Date(
    new Date(`${dateKey}T12:00:00+09:00`).getTime() + days * 86_400_000
  );
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(next); // en-CA는 YYYY-MM-DD 형식이다
}

/**
 * 해당 연도의 공휴일 전체를 계산한다 (대체공휴일 포함).
 *
 * 대체공휴일 규칙 (공휴일에 관한 법률 시행령)
 *   - 삼일절·어린이날·부처님오신날·광복절·개천절·한글날·기독탄신일:
 *     **토요일 또는 일요일**과 겹치면 대체
 *   - 설날·추석 연휴: **일요일**과 겹치면 대체 (토요일은 대상 아님)
 *   - 대체일은 그 다음 날부터 가장 가까운 비공휴일
 *   - 신정·현충일은 대체 대상이 아니다
 */
export function holidaysOf(year: number): Map<string, string> {
  const result = new Map<string, string>();
  const pending: { date: string; name: string; substituteOnSunday: boolean }[] = [];

  for (const h of SOLAR_HOLIDAYS) {
    const date = `${year}-${pad(h.month)}-${pad(h.day)}`;
    result.set(date, h.name);
    if (h.substitute) pending.push({ date, name: h.name, substituteOnSunday: false });
  }

  for (const h of LUNAR_HOLIDAYS[year] ?? []) {
    result.set(h.date, h.name);
    pending.push(h);
  }

  // 대체공휴일은 원본 공휴일이 모두 확정된 뒤에 계산해야 한다.
  // "다음 비공휴일"을 찾으려면 어떤 날이 공휴일인지 먼저 알아야 하기 때문이다.
  for (const h of pending) {
    const weekday = weekdayOf(h.date);
    const needsSubstitute = h.substituteOnSunday
      ? weekday === 0
      : weekday === 0 || weekday === 6;
    if (!needsSubstitute) continue;

    let candidate = addDays(h.date, 1);
    // 일요일이거나 이미 공휴일이면 계속 다음 날로 민다.
    for (let guard = 0; guard < 10; guard += 1) {
      if (weekdayOf(candidate) !== 0 && !result.has(candidate)) break;
      candidate = addDays(candidate, 1);
    }
    result.set(candidate, `${h.name} 대체공휴일`);
  }

  return result;
}

/** 조회 성능을 위해 연도별 결과를 캐시한다. */
const cache = new Map<number, Map<string, string>>();

function holidaysCached(year: number): Map<string, string> {
  let value = cache.get(year);
  if (!value) {
    value = holidaysOf(year);
    cache.set(year, value);
  }
  return value;
}

/** 해당 날짜가 공휴일인가. "YYYY-MM-DD" (KST) */
export function isHoliday(dateKey: string): boolean {
  const year = Number(dateKey.slice(0, 4));
  if (!Number.isFinite(year)) return false;
  return holidaysCached(year).has(dateKey);
}

/** 공휴일 명칭. 공휴일이 아니면 null. */
export function holidayName(dateKey: string): string | null {
  const year = Number(dateKey.slice(0, 4));
  if (!Number.isFinite(year)) return null;
  return holidaysCached(year).get(dateKey) ?? null;
}

/**
 * 음력 공휴일 데이터가 부족한지 확인한다.
 *
 * 등록된 마지막 연도를 넘어가면 설날·추석에 예약이 열린다. 배포 후에야
 * 발견하는 상황을 막기 위해 관리자 화면 등에서 경고할 수 있게 노출한다.
 */
export function needsHolidayUpdate(now = new Date()): boolean {
  const kstYear = Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric" }).format(now)
  );
  // 올해가 마지막 등록 연도면 내년 데이터가 없다는 뜻이다.
  return kstYear >= LAST_CONFIGURED_YEAR;
}
