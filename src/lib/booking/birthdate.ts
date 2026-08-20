/**
 * 생년월일 입력 처리.
 *
 * 클라이언트와 서버가 **같은 함수**를 쓴다. 검증을 두 벌로 두면 한쪽만
 * 고쳐지고, 화면에서는 통과하는데 서버가 400을 주는 상태가 조용히 생긴다.
 *
 * 입력은 숫자 8자리(19500305)로 받는다. 년/월/일 3-셀렉트는 시니어에게
 * 조작이 많고, `<input type="date">`의 기본 피커는 올해부터 거슬러
 * 올라가는 스피너라 1950년에 도달하려면 수십 번을 넘겨야 한다.
 * (PRD-1book1me-event-form-ux §3.2)
 */

import { dateKeyToInstant, kstDateKey, toKstParts } from "@/lib/booking/kst";

/** 나이 상한. 이보다 오래된 연도는 실입력이 아니라 오타로 본다. */
export const MAX_AGE_YEARS = 120;

export type BirthDateError = "required" | "length" | "not_a_date" | "out_of_range";

/** 오류 문구도 한 곳에 둔다 — 화면과 API가 다른 말을 하면 안 된다. */
export const BIRTH_DATE_MESSAGES: Record<BirthDateError, string> = {
  required: "생년월일을 입력해주세요.",
  length: "생년월일을 숫자 8자리로 입력해주세요. (예: 19500305)",
  not_a_date: "없는 날짜입니다. 다시 확인해주세요.",
  out_of_range: "생년월일을 다시 확인해주세요.",
};

export type BirthDateResult =
  | { ok: true; dateKey: string; instant: Date }
  | { ok: false; error: BirthDateError };

/** 숫자만 남기고 8자리로 자른다. 하이픈이 섞인 값도 그대로 받는다. */
export function birthDigits(value: string): string {
  return value.replace(/[^\d]/g, "").slice(0, 8);
}

/**
 * 입력 중간 상태까지 포함해 하이픈을 넣는다. 사용자는 숫자만 누른다.
 * "1950"      → "1950"
 * "195003"    → "1950-03"
 * "19500305"  → "1950-03-05"
 */
export function formatBirthInput(value: string): string {
  const digits = birthDigits(value);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

/**
 * 검증 + 정규화. 성공하면 "YYYY-MM-DD"와 **KST 자정 순간**을 함께 준다.
 *
 * 저장 시각을 KST 자정으로 고정하는 이유: UTC 자정으로 저장하면 UTC보다
 * 서쪽(예: 미국) 타임존에서 조회할 때 하루 앞 날짜로 보인다. 생년월일이
 * 하루 어긋나 보이는 것은 명백한 결함이다.
 *
 * @param now 테스트에서 "오늘"을 고정하기 위해 주입한다.
 */
export function parseBirthDate(value: string, now: Date = new Date()): BirthDateResult {
  const digits = birthDigits(value);
  // "비어 있다"와 "숫자가 아닌 값이 왔다"를 구분한다. 둘을 뭉치면 API로
  // "abcd"를 보낸 쪽에 "입력해주세요"라고 답해 원인을 가린다.
  if (digits.length === 0) {
    return { ok: false, error: value.trim() === "" ? "required" : "length" };
  }
  if (digits.length !== 8) return { ok: false, error: "length" };

  const dateKey = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;

  // 2월 30일·13월 같은 값은 여기서 걸린다 (dateKeyToInstant가 되돌려 확인한다).
  const instant = dateKeyToInstant(dateKey);
  if (!instant) return { ok: false, error: "not_a_date" };

  const todayKey = kstDateKey(now);
  if (dateKey > todayKey) return { ok: false, error: "out_of_range" };

  const year = Number(digits.slice(0, 4));
  if (year < toKstParts(now).year - MAX_AGE_YEARS) {
    return { ok: false, error: "out_of_range" };
  }

  return { ok: true, dateKey, instant };
}

/** "1950-03-05" → "1950년 3월 5일". 입력 직후 오타를 눈으로 잡게 하는 용도다. */
export function birthDateLabel(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return dateKey;
  const [, year, month, day] = match;
  return `${Number(year)}년 ${Number(month)}월 ${Number(day)}일`;
}
