import { describe, expect, it } from "vitest";
import {
  BIRTH_DATE_MESSAGES,
  birthDateLabel,
  formatBirthInput,
  parseBirthDate,
} from "@/lib/booking/birthdate";

/**
 * 생년월일 입력 검증.
 *
 * 화면과 서버가 같은 함수를 쓰므로 여기가 두 곳의 유일한 진실이다.
 * 통과 기준이 어긋나면 "화면에서는 되는데 신청은 안 되는" 상태가 된다.
 */

// 테스트가 실제 오늘 날짜에 따라 통과/실패하면 안 되므로 기준 시각을 고정한다.
const NOW = new Date("2026-08-20T03:00:00.000Z"); // KST 2026-08-20 12:00

describe("입력 중 하이픈 자동 삽입", () => {
  it("자릿수에 따라 단계적으로 넣는다", () => {
    expect(formatBirthInput("1")).toBe("1");
    expect(formatBirthInput("1950")).toBe("1950");
    expect(formatBirthInput("19500")).toBe("1950-0");
    expect(formatBirthInput("195003")).toBe("1950-03");
    expect(formatBirthInput("19500305")).toBe("1950-03-05");
  });

  it("8자리를 넘는 입력은 잘라낸다", () => {
    expect(formatBirthInput("1950030512345")).toBe("1950-03-05");
  });

  it("이미 하이픈이 있는 값을 다시 넣어도 같은 결과다 (멱등)", () => {
    expect(formatBirthInput("1950-03-05")).toBe("1950-03-05");
  });

  it("문자가 섞여도 숫자만 남긴다", () => {
    expect(formatBirthInput("1950년3월5일")).toBe("1950-35");
  });
});

describe("검증", () => {
  it("정상 값은 dateKey와 KST 자정 순간을 준다", () => {
    const result = parseBirthDate("19500305", NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.dateKey).toBe("1950-03-05");
    // KST 자정 = 전날 15:00 UTC. 이 값이 어긋나면 조회 시 하루 밀린다.
    expect(result.instant.toISOString()).toBe("1950-03-04T15:00:00.000Z");
  });

  it("하이픈이 있는 형태도 그대로 받는다 (서버가 받는 형식)", () => {
    const result = parseBirthDate("1950-03-05", NOW);
    expect(result.ok).toBe(true);
  });

  it("비어 있으면 required", () => {
    expect(parseBirthDate("", NOW)).toEqual({ ok: false, error: "required" });
    expect(parseBirthDate("   ", NOW)).toEqual({ ok: false, error: "required" });
  });

  it("8자리가 아니면 length", () => {
    expect(parseBirthDate("1950305", NOW)).toEqual({ ok: false, error: "length" });
    expect(parseBirthDate("500305", NOW)).toEqual({ ok: false, error: "length" });
  });

  it("숫자가 하나도 없는 값은 required가 아니라 length다", () => {
    // API로 "not-a-date"를 보낸 쪽에 "입력해주세요"라고 답하면 원인을 가린다.
    expect(parseBirthDate("not-a-date", NOW)).toEqual({ ok: false, error: "length" });
  });

  it("없는 날짜는 not_a_date", () => {
    expect(parseBirthDate("19500230", NOW)).toEqual({ ok: false, error: "not_a_date" });
    expect(parseBirthDate("19501301", NOW)).toEqual({ ok: false, error: "not_a_date" });
    expect(parseBirthDate("19500100", NOW)).toEqual({ ok: false, error: "not_a_date" });
  });

  it("윤년 2월 29일은 통과하고, 평년 2월 29일은 막는다", () => {
    expect(parseBirthDate("19520229", NOW).ok).toBe(true);
    expect(parseBirthDate("19510229", NOW)).toEqual({ ok: false, error: "not_a_date" });
  });

  it("미래 날짜는 out_of_range", () => {
    expect(parseBirthDate("20301231", NOW)).toEqual({ ok: false, error: "out_of_range" });
  });

  it("오늘(KST)은 허용한다 — 경계", () => {
    expect(parseBirthDate("20260820", NOW).ok).toBe(true);
  });

  it("내일(KST)은 막는다 — 경계", () => {
    expect(parseBirthDate("20260821", NOW)).toEqual({ ok: false, error: "out_of_range" });
  });

  it("120년보다 오래된 연도는 out_of_range", () => {
    expect(parseBirthDate("18000101", NOW)).toEqual({ ok: false, error: "out_of_range" });
    expect(parseBirthDate("19050101", NOW)).toEqual({ ok: false, error: "out_of_range" });
  });

  it("만 120세 경계 연도는 허용한다", () => {
    expect(parseBirthDate("19060101", NOW).ok).toBe(true);
  });

  /**
   * 서버가 UTC로 도는 것을 전제하면 안 된다. Vercel은 UTC지만 로컬·다른
   * 런타임은 다를 수 있고, KST 자정 고정이 깨지면 하루가 밀린다.
   */
  it("KST 자정 직전에 판정해도 오늘 기준이 흔들리지 않는다", () => {
    const justBeforeMidnightKst = new Date("2026-08-20T14:59:00.000Z"); // KST 8/20 23:59
    expect(parseBirthDate("20260820", justBeforeMidnightKst).ok).toBe(true);
    expect(parseBirthDate("20260821", justBeforeMidnightKst).ok).toBe(false);
  });
});

describe("확인 문구", () => {
  it("사람이 읽는 형태로 바꾼다", () => {
    expect(birthDateLabel("1950-03-05")).toBe("1950년 3월 5일");
    expect(birthDateLabel("2001-12-31")).toBe("2001년 12월 31일");
  });

  it("형식이 아니면 원문을 그대로 돌려준다", () => {
    expect(birthDateLabel("1950")).toBe("1950");
  });
});

describe("오류 문구", () => {
  it("모든 오류 코드에 문구가 있다 — 빈 메시지가 화면에 뜨면 안 된다", () => {
    for (const key of ["required", "length", "not_a_date", "out_of_range"] as const) {
      expect(BIRTH_DATE_MESSAGES[key].length).toBeGreaterThan(0);
    }
  });
});
