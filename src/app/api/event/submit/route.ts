import { NextResponse } from "next/server";
import { submissionSchema } from "@/lib/validations";
import { cleanPhoneNumber } from "@/lib/event-utils";
import { Pool } from "pg";

// Create a direct PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

    // Get current time in KST (Asia/Seoul)
    const nowKST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
    const kstDate = new Date(nowKST);

    // Create submission using direct SQL
    const query = `
      INSERT INTO "Submission" (id, name, "birthDate", phone, "subjectType", "subjectOther", "audioFiles", status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $8)
      RETURNING id
    `;

    const values = [
      name,
      new Date(birthDate),
      cleanedPhone,
      subjectType,
      subjectType === "기타" ? subjectOther : null,
      JSON.stringify(audioFiles || []),
      "PENDING",
      kstDate
    ];

    const dbResult = await pool.query(query, values);
    const submissionId = dbResult.rows[0].id;

    return NextResponse.json({
      submissionId,
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
