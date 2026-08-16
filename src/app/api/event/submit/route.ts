import { NextResponse } from "next/server";
import { submissionSchema } from "@/lib/validations";
import { cleanPhoneNumber } from "@/lib/event-utils";
import { prisma } from "@/lib/db";
import { slotUnavailableReason } from "@/lib/booking/slots";
import { BOOKING } from "@/lib/booking/config";

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
};

export async function POST(request: Request) {
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
        const taken = await tx.submission.findMany({
          where: {
            preferredSlotAt: slotAt,
            status: { in: ["PENDING", "CONTACTED"] },
          },
          select: { preferredSlotAt: true },
        });

        const reason = slotUnavailableReason(slotAt, {
          now,
          occupied: taken
            .filter((t) => t.preferredSlotAt !== null)
            .map((t) => ({ startAt: (t.preferredSlotAt as Date).toISOString() })),
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
