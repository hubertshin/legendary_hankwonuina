import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Config: ConstructorParameters<typeof S3Client>[0] = {
  region: process.env.S3_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
};

// Support S3-compatible services (Cloudflare R2, MinIO, etc.)
if (process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT;
  s3Config.forcePathStyle = true;
}

export const s3Client = new S3Client(s3Config);

const BUCKET = process.env.S3_BUCKET || "hankwon-uina-audio";

export interface UploadUrlParams {
  key: string;
  contentType: string;
  expiresIn?: number; // seconds
}

export interface DownloadUrlParams {
  key: string;
  expiresIn?: number; // seconds
  filename?: string;
}

/**
 * Generate a presigned URL for uploading a file to S3
 */
export async function getUploadUrl({
  key,
  contentType,
  expiresIn = 3600,
}: UploadUrlParams): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading/streaming a file from S3
 */
export async function getDownloadUrl({
  key,
  expiresIn = 3600,
  filename,
}: DownloadUrlParams): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ...(filename && {
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
    }),
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for streaming audio (no download header)
 */
export async function getStreamUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Check if a file exists in S3
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate S3 key for audio asset
 */
export function generateAudioKey(
  userId: string,
  projectId: string,
  clipIndex: number,
  extension: string
): string {
  const timestamp = Date.now();
  return `audio/${userId}/${projectId}/clip-${clipIndex}-${timestamp}.${extension}`;
}

/**
 * Generate S3 key for export file
 */
export function generateExportKey(
  userId: string,
  projectId: string,
  format: "pdf" | "docx"
): string {
  const timestamp = Date.now();
  return `exports/${userId}/${projectId}/draft-${timestamp}.${format}`;
}
