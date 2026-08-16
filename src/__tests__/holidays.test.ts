import { describe, expect, it } from "vitest";
import { holidaysOf, isHoliday, holidayName, needsHolidayUpdate } from "@/lib/booking/holidays";
import { candidateSlotStarts } from "@/lib/booking/slots";

/**
 * 공휴일 계산 테스트.
 *
 * 공휴일에 예약이 열리면 그 날 고객에게 전화를 걸게 된다. 실제로 2026-08-17
 * (광복절 대체공휴일)에 예약이 열려 있었으므로, 그 날짜를 회귀 테스트로 고정한다.
 */

describe("대체공휴일 계산", () => {
  it("광복절이 토요일이면 다음 월요일이 대체공휴일이다", () => {
    // 2026-08-15(토) → 8/16은 일요일이라 건너뛰고 8/17(월)
    expect(isHoliday("2026-08-15")).toBe(true);
    expect(isHoliday("2026-08-17")).toBe(true);
    expect(holidayName("2026-08-17")).toBe("광복절 대체공휴일");
  });

  it("삼일절이 일요일이면 다음 월요일이 대체공휴일이다", () => {
    expect(isHoliday("2026-03-01")).toBe(true);
    expect(isHoliday("2026-03-02")).toBe(true);
  });

  it("개천절이 토요일이면 다음 월요일이 대체공휴일이다", () => {
    expect(isHoliday("2026-10-05")).toBe(true);
  });

  it("부처님오신날이 일요일이면 대체공휴일이 생긴다", () => {
    expect(isHoliday("2026-05-24")).toBe(true);
    expect(isHoliday("2026-05-25")).toBe(true);
  });

  it("기독탄신일이 토요일이면 대체공휴일이 생긴다", () => {
    // 2027-12-25(토) → 12/26(일) 건너뛰고 12/27(월)
    expect(isHoliday("2027-12-27")).toBe(true);
  });

  it("현충일은 토·일과 겹쳐도 대체공휴일이 없다", () => {
    // 국가추모일이라 대체 대상이 아니다
    expect(isHoliday("2026-06-06")).toBe(true); // 토요일
    expect(isHoliday("2026-06-08")).toBe(false); // 다음 월요일은 영업일
    expect(isHoliday("2027-06-06")).toBe(true); // 일요일
    expect(isHoliday("2027-06-07")).toBe(false);
  });

  it("신정은 대체공휴일 대상이 아니다", () => {
    // 2028-01-01은 토요일이지만 대체가 없다
    expect(isHoliday("2028-01-03")).toBe(false);
  });

  it("평일에 있는 공휴일은 대체가 생기지 않는다", () => {
    expect(isHoliday("2026-10-09")).toBe(true); // 한글날(금)
    expect(isHoliday("2026-10-12")).toBe(false); // 다음 월요일
  });
});

describe("설날·추석 연휴", () => {
  it("설날 연휴 3일이 모두 공휴일이다", () => {
    for (const d of ["2026-02-16", "2026-02-17", "2026-02-18"]) {
      expect(isHoliday(d)).toBe(true);
    }
  });

  it("추석 연휴 3일이 모두 공휴일이다", () => {
    for (const d of ["2026-09-24", "2026-09-25", "2026-09-26"]) {
      expect(isHoliday(d)).toBe(true);
    }
  });

  it("연휴가 일요일을 포함하면 대체공휴일이 생긴다", () => {
    // 2027 설날: 2/6(토) 2/7(일) 2/8(월) → 일요일 포함 → 2/9(화) 대체
    expect(isHoliday("2027-02-09")).toBe(true);
  });

  it("연휴가 토요일만 포함하면 대체공휴일이 없다", () => {
    // 2026 추석: 목·금·토 → 일요일 없음 → 대체 없음
    expect(isHoliday("2026-09-28")).toBe(false); // 다음 월요일
  });
});

describe("연도별 목록", () => {
  it("2026년 공휴일 수가 예상과 같다", () => {
    // 양력 8 + 음력 7 + 대체 4(삼일절·부처님오신날·광복절·개천절)
    expect(holidaysOf(2026).size).toBe(19);
  });

  it("음력 데이터가 없는 연도는 양력 공휴일만 나온다", () => {
    const far = holidaysOf(2035);
    expect(far.has("2035-01-01")).toBe(true);
    // 설날·추석이 없으므로 20일을 넘지 않는다
    expect(far.size).toBeLessThan(15);
  });

  it("음력 데이터 갱신이 필요한지 알려준다", () => {
    // 마지막 등록 연도(2027) 이후에는 갱신이 필요하다
    expect(needsHolidayUpdate(new Date("2028-01-01T00:00:00+09:00"))).toBe(true);
    expect(needsHolidayUpdate(new Date("2026-01-01T00:00:00+09:00"))).toBe(false);
  });
});

describe("슬롯 생성에 반영된다", () => {
  it("대체공휴일에는 슬롯이 만들어지지 않는다", () => {
    // 사용자가 지적한 그 날 — 월요일이지만 광복절 대체공휴일이다
    expect(candidateSlotStarts("2026-08-17")).toHaveLength(0);
  });

  it("설날·추석에는 슬롯이 만들어지지 않는다", () => {
    expect(candidateSlotStarts("2026-02-17")).toHaveLength(0);
    expect(candidateSlotStarts("2026-09-25")).toHaveLength(0);
  });

  it("공휴일이 아닌 평일에는 슬롯이 만들어진다", () => {
    // 2026-08-18(화)
    expect(candidateSlotStarts("2026-08-18").length).toBeGreaterThan(0);
  });
});
