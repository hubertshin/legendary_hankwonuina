import { NextResponse } from "next/server";
import { submissionSchema } from "@/lib/validations";
import { cleanPhoneNumber } from "@/lib/event-utils";
import { prisma } from "@/lib/db";
import { slotUnavailableReason } from "@/lib/booking/slots";
import { BOOKING } from "@/lib/booking/config";
import { notifyNewBooking } from "@/lib/notify";
import {
  GLOBAL_KEY,
  SUBMIT_ATTEMPT_RULE,
  SUBMIT_GLOBAL_RULE,
  SUBMIT_SUCCESS_RULE,
  checkOptional,
  clientKey,
  consumeOptional,
  consumeRateLimit,
  peekOptional,
  peekRateLimit,
} from "@/lib/booking/ratelimit";

/**
 * POST /api/event/submit
 * Create a new submission (NO AUTH required)
 *
 * 상담 예약(희망 통화 시각)을 함께 받는다. 시간을 고른 신청은 정원 확인과
 * 저장을 같은 트랜잭션에서 처리해 더블 부킹을 막는다 — 슬롯 조회 시점과
 * 제출 시점 사이에 다른 사람이 같은 시간을 잡았을 수 있다.
 */

/** 슬롯을 쓸 수 없는 이유별 안내. 전부 "마감"으로 뭉뚱그리면 원인을 가릴 수 없다. */
const SLOT_ERRORS: Record<string, string> = {
  full: "방금 그 시간이 마감됐습니다. 다른 시간을 선택해주세요.",
  too_soon: `상담 준비를 위해 ${BOOKING.minLeadHours}시간 뒤부터 예약할 수 있습니다.`,
  out_of_range: `예약은 ${BOOKING.maxAdvanceDays}일 뒤까지 가능합니다.`,
  not_a_slot: "선택할 수 없는 시간입니다. 목록에서 다시 골라주세요.",
  blocked: "그 시간은 상담이 어렵습니다. 다른 시간을 선택해주세요.",
};

export async function POST(request: Request) {
  // 시도 한도와 성공 한도를 나눈다. 입력 실수로 검증 오류를 몇 번 받는 것은
  // 정상이므로, 그것 때문에 정상 사용자가 잠기면 안 된다.
  const attemptKey = clientKey(request, "submit-attempt");
  const successKey = clientKey(request, "submit-success");

  const attempts = checkOptional(attemptKey, SUBMIT_ATTEMPT_RULE);
  if (!attempts.allowed) {
    return NextResponse.json(
      {
        error: `요청이 너무 많습니다. ${Math.ceil(
          attempts.retryAfterSeconds / 60
        )}분 후 다시 시도해주세요.`,
      },
      { status: 429, headers: { "Retry-After": String(attempts.retryAfterSeconds) } }
    );
  }

  const successes = peekOptional(successKey, SUBMIT_SUCCESS_RULE);
  if (!successes.allowed) {
    return NextResponse.json(
      {
        error: `이미 여러 건을 신청하셨습니다. ${Math.ceil(
          successes.retryAfterSeconds / 60
        )}분 후 다시 시도하시거나 전화로 문의해주세요.`,
      },
      { status: 429, headers: { "Retry-After": String(successes.retryAfterSeconds) } }
    );
  }

  // IP 판정이 뚫려도 피해를 묶어두는 최후 방어선.
  const global = peekRateLimit(GLOBAL_KEY, SUBMIT_GLOBAL_RULE);
  if (!global.allowed) {
    console.warn("[event/submit] 전역 신청 한도 도달 — 스팸 가능성 확인 필요");
    return NextResponse.json(
      { error: "잠시 접수가 몰리고 있습니다. 1분 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(global.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();

    const result = submissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      birthDate,
      phone,
      subjectType,
      subjectOther,
      audioFiles,
      preferredSlotAt,
      anyTimeOk,
      consentPrivacy,
    } = result.data;

    // 예약 흐름(시간을 골랐거나 "아무 때나")이면 개인정보 동의가 필수다.
    // 기존 음성 신청 흐름은 동의 절차가 따로 있으므로 강제하지 않는다.
    const isBookingFlow = Boolean(preferredSlotAt) || anyTimeOk === true;
    if (isBookingFlow && consentPrivacy !== true) {
      return NextResponse.json(
        { error: "개인정보 수집·이용에 동의해주셔야 신청할 수 있습니다." },
        { status: 400 }
      );
    }

    const slotAt = preferredSlotAt ? new Date(preferredSlotAt) : null;

    const submission = await prisma.$transaction(async (tx) => {
      if (slotAt) {
        const now = new Date();

        // 같은 슬롯을 이미 점유한 신청을 세어 정원을 확인한다.
        //
        // 시각이 정확히 같은 건만 찾으면 안 된다. 슬롯 길이를 30분에서
        // 1시간으로 바꾸기 전에 잡힌 14:30 예약은 14:00과 시각이 다르므로
        // 조회에서 빠지고, 그 칸이 비어 있는 것으로 판정돼 같은 시간에
        // 두 통화가 잡힌다. 슬롯 **구간**으로 찾는다.
        const slotEnd = new Date(slotAt.getTime() + BOOKING.slotMinutes * 60_000);
        const taken = await tx.submission.findMany({
          where: {
            preferredSlotAt: { gte: slotAt, lt: slotEnd },
            status: { in: ["PENDING", "CONTACTED"] },
          },
          select: { preferredSlotAt: true },
        });

        // 화면을 열어둔 사이에 운영자가 막았을 수 있다.
        // 목록에서 사라진 것만으로는 충분하지 않아 저장 직전에 다시 본다.
        const block = await tx.slotBlock.findUnique({
          where: { startAt: slotAt },
          select: { id: true },
        });

        const reason = slotUnavailableReason(slotAt, {
          now,
          occupied: taken
            .filter((t) => t.preferredSlotAt !== null)
            .map((t) => ({ startAt: (t.preferredSlotAt as Date).toISOString() })),
          blocked: block ? [slotAt.toISOString()] : [],
        });

        if (reason) {
          throw new SlotError(SLOT_ERRORS[reason] ?? "선택할 수 없는 시간입니다.");
        }
      }

      return tx.submission.create({
        data: {
          name,
          birthDate: birthDate ? new Date(birthDate) : null,
          phone: cleanPhoneNumber(phone),
          subjectType,
          subjectOther: subjectType === "기타" ? subjectOther : null,
          audioFiles: audioFiles || [],
          status: "PENDING",
          preferredSlotAt: slotAt,
          anyTimeOk: anyTimeOk === true,
          consentPrivacyAt: consentPrivacy === true ? new Date() : null,
        },
      });
    });

    // 슬롯을 실제로 점유한 시점에만 성공 한도를 소비한다.
    consumeOptional(successKey, SUBMIT_SUCCESS_RULE);
    consumeRateLimit(GLOBAL_KEY, SUBMIT_GLOBAL_RULE);

    // 운영자 알림. 이미 저장이 끝났으므로 실패해도 응답은 성공이어야 한다.
    // notifyNewBooking은 예외를 던지지 않지만, 방어적으로 한 번 더 감싼다.
    //
    // 결과를 DB에 남기는 이유: 발송이 조용히 실패하면 아무도 모른다. 실제로
    // API 키가 무효화된 동안 신청 두 건의 알림이 유실됐고, 고객이 알려주기
    // 전까지 알 수 없었다. admin에서 실패한 건을 볼 수 있어야 한다.
    try {
      const results = await notifyNewBooking({
        submissionId: submission.id,
        name: submission.name,
        phone: submission.phone,
        subjectType: submission.subjectType,
        // 현재 예약 폼은 성함·연락처만 받는다. subjectOther는 기존 음성
        // 신청 흐름에서만 채워지므로 있으면 함께 보여준다.
        subjectName: submission.subjectOther,
        subjectAgeRange: null,
        question: null,
        preferredSlotAt: submission.preferredSlotAt
          ? submission.preferredSlotAt.toISOString()
          : null,
        anyTimeOk: submission.anyTimeOk,
        createdAt: submission.createdAt.toISOString(),
      });

      const sent = results.some((r) => r.ok);
      const reason = results.find((r) => !r.ok)?.reason;
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          notifiedAt: sent ? new Date() : null,
          notifyError: sent ? null : (reason ?? "unknown").slice(0, 500),
        },
      });
    } catch (error) {
      console.error("[event/submit] 알림 처리 중 예외 (신청은 저장됨):", error);
      // 상태 기록 자체가 실패해도 신청은 그대로 둔다.
      await prisma.submission
        .update({
          where: { id: submission.id },
          data: { notifyError: "알림 처리 중 예외" },
        })
        .catch(() => undefined);
    }

    return NextResponse.json({
      submissionId: submission.id,
      preferredSlotAt: submission.preferredSlotAt,
      anyTimeOk: submission.anyTimeOk,
      success: true,
      message: "자서전 제1장 무료제작 이벤트 신청이 완료되었습니다.",
    });
  } catch (error) {
    if (error instanceof SlotError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Event submit error:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}

class SlotError extends Error {}
