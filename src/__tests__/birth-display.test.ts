import { describe, expect, it } from "vitest";
import { ageFromBirthDate, formatBirthDate } from "@/lib/booking/birth-display";

/**
 * 관리자 목록의 생년월일 표시.
 *
 * 서버·브라우저 타임존과 무관하게 같은 값이 나와야 한다. 조용히 하루 밀리는
 * 종류의 오류라 경계값을 고정해둔다.
 */

// 기준 시각을 고정한다. 실제 오늘 날짜에 따라 통과 여부가 바뀌면 안 된다.
const NOW = new Date("2026-08-20T03:00:00.000Z"); // KST 2026-08-20 12:00

describe("표시 형식", () => {
  it("KST 자정으로 저장된 값을 그 날짜로 보여준다", () => {
    // 예약 폼이 저장하는 형태 (KST 1950-03-05 00:00 = UTC 1950-03-04 15:00)
    expect(formatBirthDate("1950-03-04T15:00:00.000Z")).toBe("1950. 3. 5.");
  });

  it("UTC 자정으로 저장된 옛 데이터도 같은 날짜로 보여준다", () => {
    // 통합 이전 폼이 저장한 형태. KST로는 같은 날 09:00이라 날짜가 유지된다.
    expect(formatBirthDate("1950-03-05T00:00:00.000Z")).toBe("1950. 3. 5.");
  });

  it("손상된 값에는 형식을 지어내지 않는다", () => {
    expect(formatBirthDate("어쩌구")).toBeNull();
  });
});

describe("만 나이", () => {
  it("생일이 지났으면 그대로", () => {
    // 1950-03-05 → 2026-08-20 기준 생일 지남
    expect(ageFromBirthDate("1950-03-04T15:00:00.000Z", NOW)).toBe(76);
  });

  it("생일이 아직 안 지났으면 한 살 뺀다", () => {
    // 1950-12-25 → 2026-08-20 기준 아직 안 지남
    expect(ageFromBirthDate("1950-12-24T15:00:00.000Z", NOW)).toBe(75);
  });

  it("생일 당일은 이미 지난 것으로 센다", () => {
    // 1950-08-20
    expect(ageFromBirthDate("1950-08-19T15:00:00.000Z", NOW)).toBe(76);
  });

  it("생일 하루 전은 아직 안 지난 것으로 센다", () => {
    // 1950-08-21
    expect(ageFromBirthDate("1950-08-20T15:00:00.000Z", NOW)).toBe(75);
  });

  it("미래 날짜에는 나이를 지어내지 않는다", () => {
    expect(ageFromBirthDate("2030-01-01T00:00:00.000Z", NOW)).toBeNull();
  });

  it("사람 수명을 벗어난 값은 비운다", () => {
    expect(ageFromBirthDate("1800-01-01T00:00:00.000Z", NOW)).toBeNull();
  });

  it("손상된 값은 비운다", () => {
    expect(ageFromBirthDate("어쩌구", NOW)).toBeNull();
  });

  /**
   * 판정 시점이 KST 자정을 넘나들 때 나이가 흔들리면 안 된다.
   * 서버가 UTC로 도는 것을 전제하면 이 경계에서 하루가 밀린다.
   */
  it("KST 자정 직전·직후에 생일 판정이 흔들리지 않는다", () => {
    const beforeMidnight = new Date("2026-08-20T14:59:00.000Z"); // KST 8/20 23:59
    const afterMidnight = new Date("2026-08-20T15:01:00.000Z"); // KST 8/21 00:01
    const birth = "1950-08-20T15:00:00.000Z"; // KST 1950-08-21

    expect(ageFromBirthDate(birth, beforeMidnight)).toBe(75); // 생일 하루 전
    expect(ageFromBirthDate(birth, afterMidnight)).toBe(76); // 생일 당일
  });
});
