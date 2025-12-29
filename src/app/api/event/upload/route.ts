import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

/**
 * POST /api/event/upload
 * Upload audio file to local filesystem (development mode)
 */
export async function POST(request: Request) {
  try {
    console.log("Upload API called");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const s3Key = formData.get("s3Key") as string;

    console.log("File:", file?.name, "Size:", file?.size);
    console.log("S3 Key:", s3Key);

    if (!file || !s3Key) {
      console.error("Missing file or s3Key");
      return NextResponse.json(
        { error: "Missing file or s3Key" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, s3Key);

    console.log("File path:", filePath);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) {
      console.log("Creating directory:", dir);
      await mkdir(dir, { recursive: true });
    }

    await writeFile(filePath, buffer);
    console.log("File saved successfully");

    return NextResponse.json({
      success: true,
      url: `/uploads/${s3Key}`
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

