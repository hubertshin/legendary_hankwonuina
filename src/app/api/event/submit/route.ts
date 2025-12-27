import { NextResponse } from "next/server";
import { submissionSchema } from "@/lib/validations";
import { cleanPhoneNumber } from "@/lib/event-utils";
import { prisma } from "@/lib/db";

/**
 * POST /api/event/submit
 * Create a new submission (NO AUTH required)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const result = submissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, birthDate, phone, subjectType, subjectOther, audioFiles } = result.data;

    // Clean phone number (remove separators)
    const cleanedPhone = cleanPhoneNumber(phone);

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        phone: cleanedPhone,
        subjectType,
        subjectOther: subjectType === "기타" ? subjectOther : null,
        audioFiles: audioFiles,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      submissionId: submission.id,
      success: true,
      message: "자서전 제1장 무료제작 이벤트 신청이 완료되었습니다.",
    });
  } catch (error) {
    console.error("Event submit error:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
