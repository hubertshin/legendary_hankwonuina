/**
 * 생년월일 표시.
 *
 * 저장은 UTC 순간이지만 판정·표시는 항상 KST 벽시계여야 한다. 브라우저
 * 타임존을 그대로 따라가면 UTC보다 서쪽(예: 미국)에서 관리자 화면을 열 때
 * 생년월일이 **하루 앞으로** 보인다. 운영자가 해외에서 접속할 수 있고,
 * 생년월일이 어긋나 보이는 것은 그 자체로 결함이다.
 */

import { toKstParts } from "@/lib/booking/kst";

/** 사람의 수명으로 있을 수 없는 값은 계산 결과가 아니라 데이터 오류로 본다. */
const MAX_PLAUSIBLE_AGE = 150;

function safeKstParts(value: string | Date) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : toKstParts(date);
}

/** "1950. 3. 5." — 표 한 칸에 들어가야 하므로 짧은 형식을 쓴다. 값이 이상하면 null. */
export function formatBirthDate(value: string | Date): string | null {
  const parts = safeKstParts(value);
  return parts ? `${parts.year}. ${parts.month}. ${parts.day}.` : null;
}

/**
 * 만 나이.
 *
 * 생년월일 숫자만 있으면 상담사가 전화 걸 때마다 암산해야 하고, 결국 안 보게
 * 된다. 화법·질문지를 맞추는 데 실제로 쓰이는 값은 나이다.
 *
 * @param now 테스트에서 "오늘"을 고정하기 위해 주입한다.
 */
export function ageFromBirthDate(value: string | Date, now: Date = new Date()): number | null {
  const birth = safeKstParts(value);
  const today = safeKstParts(now);
  if (!birth || !today) return null;

  let age = today.year - birth.year;
  // 올해 생일이 아직 안 지났으면 한 살 뺀다
  if (today.month < birth.month || (today.month === birth.month && today.day < birth.day)) {
    age -= 1;
  }

  // 미래 날짜나 손상된 값이 들어와도 나이를 지어내지 않는다.
  return age >= 0 && age <= MAX_PLAUSIBLE_AGE ? age : null;
}
