/**
 * 상담 예약 운영 규칙.
 *
 * 지금은 코드 상수지만 **여기 한 곳에만** 둔다. 나중에 관리자 화면에서
 * 편집하도록 DB로 옮길 때 호출부를 바꾸지 않아도 되게 하기 위함이다.
 * (PRD-1book1me-booking-integration §5)
 */

export interface DayWindow {
  start: string; // "10:00"
  end: string; // "19:00"
}

export const BOOKING = {
  /** 상담 1건 길이 = 슬롯 단위 (분) */
  slotMinutes: 30,

  /** 요일별 운영 시간. null이면 휴무. 0=일 … 6=토 */
  windowsByWeekday: {
    0: null, // 일요일 휴무
    1: { start: "14:00", end: "19:00" },
    2: { start: "14:00", end: "19:00" },
    3: { start: "14:00", end: "19:00" },
    4: { start: "14:00", end: "19:00" },
    5: { start: "14:00", end: "19:00" },
    6: null, // 토요일 휴무
  } as Record<number, DayWindow | null>,

  /**
   * 점심시간 — 이 구간과 겹치는 슬롯은 만들지 않는다.
   *
   * 현재 운영 시작이 14:00이라 이 설정은 실제로 아무 슬롯도 걸러내지 않는다.
   * 나중에 오전 운영을 다시 열 때를 대비해 남겨둔다.
   */
  lunchBreak: { start: "12:30", end: "13:30" } as DayWindow,

  /** 최소 리드타임(시간). 당일 예약을 허용하되 준비 시간을 확보한다 */
  minLeadHours: 3,

  /** 오늘부터 며칠 후까지 예약 가능 */
  maxAdvanceDays: 14,

  /** 슬롯당 동시 상담 가능 수 (상담사 수) */
  capacityPerSlot: 1,

  /** 잔여 슬롯이 이 값 이하일 때만 "N자리 남았어요"를 표시 */
  lowRemainingThreshold: 3,
} as const;

/** 시간대 그룹 — 슬롯을 나열하지 않고 묶어 보여준다 (인지 부담 감소) */
export const TIME_GROUPS = [
  { id: "morning", label: "오전", fromHour: 0, toHour: 12 },
  { id: "afternoon", label: "오후", fromHour: 12, toHour: 17 },
  { id: "evening", label: "저녁", fromHour: 17, toHour: 24 },
] as const;

/**
 * 상담 발신 전화번호.
 *
 * 미등록 번호는 수신 거부되므로 신청 단계에서 미리 알려준다. 시니어 타깃에서
 * 부재중 손실을 줄이는 가장 실질적인 장치다.
 *
 * 상담사가 여러 명이라 번호가 둘이다. 뒷자리를 가린 형태로 노출하므로
 * 연락처 저장은 불가능하고, "이 번호로 오면 받아주세요" 수준의 인지만 준다.
 */
export const CALLER_IDS: readonly string[] = (
  process.env.NEXT_PUBLIC_CALLER_IDS ?? "010-9892-98XX,010-5879-07XX"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

/** "010-9892-98XX 번호 또는 010-5879-07XX 번호" */
export const CALLER_ID_LABEL = CALLER_IDS.map((n) => `${n} 번호`).join(" 또는 ");

// 공휴일은 src/lib/booking/holidays.ts 에서 계산한다 (대체공휴일 포함).

/** 트랙(누구의 자서전) → Submission.subjectType 매핑 */
export const TRACKS = [
  {
    id: "self",
    subjectType: "본인",
    emoji: "📖",
    title: "제 이야기를\n남기고 싶어요",
    caption: "내 삶을 한 권으로",
  },
  {
    id: "family",
    subjectType: "부모님",
    emoji: "🎁",
    title: "부모님·가족을\n위해 알아봐요",
    caption: "선물로 드리고 싶어요",
  },
] as const;

export type TrackId = (typeof TRACKS)[number]["id"];
