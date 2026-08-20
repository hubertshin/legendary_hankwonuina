import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { Pool, types } from "pg";
import { z } from "zod";

/*
  `timestamp without time zone`(OID 1114)을 UTC로 읽는다.

  Prisma의 DateTime 컬럼은 값을 UTC로 저장하는데, node-postgres는 타임존이
  없는 컬럼을 **Node 프로세스의 로컬 타임존**으로 해석한다. 그래서 이 목록은
  Prisma를 쓰는 상세 화면과 시각이 어긋난다.

  프로덕션(Vercel)은 UTC로 돌아 우연히 맞아떨어지지만, 로컬 개발(KST)에서는
  모든 시각이 9시간 밀린다. 생년월일은 하루가 통째로 어긋나 보인다.
  "배포하면 맞는다"는 조건에 기대는 대신 파서를 명시한다.

  pg 모듈 전역에 적용되는 설정이지만 이 앱에서 pg를 직접 쓰는 곳은 여기뿐이고,
  읽는 컬럼이 전부 Prisma가 UTC로 넣은 값이라 전부 같은 규칙이 맞다.
*/
types.setTypeParser(types.builtins.TIMESTAMP, (value) =>
  new Date(`${value.replace(" ", "T")}Z`)
);

// Create a direct PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const querySchema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "PROCESSING", "COMPLETED"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /api/admin/submissions
 * List all submissions (ADMIN only)
 */
export async function GET(request: Request) {
  try {
    // Require admin authentication
    await requireAdmin();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const result = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { status, limit, offset } = result.data;

    // Build query with optional status filter
    let query = `
      SELECT id, name, "birthDate", phone, "subjectType", "subjectOther", "audioFiles", status,
             "preferredSlotAt", "anyTimeOk", "consentPrivacyAt",
             "calledAt", "callResult", "adminNotes", "notifiedAt", "notifyError", "createdAt", "updatedAt"
      FROM "Submission"
    `;
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` WHERE status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    query += ` ORDER BY "createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    // Count query
    let countQuery = `SELECT COUNT(*) FROM "Submission"`;
    const countValues: string[] = [];
    if (status) {
      countQuery += ` WHERE status = $1`;
      countValues.push(status);
    }

    // Execute queries
    const [submissionsResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, countValues),
    ]);

    const submissions = submissionsResult.rows;
    const total = parseInt(countResult.rows[0].count, 10);

    return NextResponse.json({
      submissions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Admin submissions GET error:", error);

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
