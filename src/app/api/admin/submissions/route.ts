import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { Pool } from "pg";
import { z } from "zod";

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
      SELECT id, name, "birthDate", phone, "subjectType", "subjectOther", "audioFiles", status, "createdAt", "updatedAt"
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
