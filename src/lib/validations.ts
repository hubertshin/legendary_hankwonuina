import { z } from "zod";

// Audio upload validation
export const audioUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum([
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/m4a",
    "audio/x-m4a",
    "audio/mp4",
  ]),
  size: z.number().max(200 * 1024 * 1024, "파일 크기는 200MB를 초과할 수 없습니다"),
  clipIndex: z.number().min(1).max(3),
});

export const createProjectSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  status: z.enum(["DRAFT", "UPLOADING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
});

export const submitProjectSchema = z.object({
  projectId: z.string().cuid(),
});

// Draft editing
export const updateDraftSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  chapters: z.array(z.object({
    title: z.string(),
    content: z.string(),
    citations: z.array(z.string()).optional(),
    uncertainParts: z.array(z.string()).optional(),
  })).optional(),
});

export const regenerateSectionSchema = z.object({
  draftId: z.string().cuid(),
  chapterIndex: z.number().min(0),
  feedback: z.string().min(1).max(1000),
});

// Export request
export const exportRequestSchema = z.object({
  projectId: z.string().cuid(),
  format: z.enum(["pdf", "docx"]),
});

// Payment
export const createPaymentSchema = z.object({
  projectId: z.string().cuid(),
});

// Admin queries
export const jobQuerySchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
  type: z.enum(["STT", "EXTRACT", "WRITE", "EXPORT_PDF", "EXPORT_DOCX"]).optional(),
  projectId: z.string().cuid().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Event submission validation
export const eventAudioUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum([
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/m4a",
    "audio/x-m4a",
    "audio/mp4",
    "audio/webm",
  ]),
  size: z.number().max(200 * 1024 * 1024, "파일 크기는 200MB를 초과할 수 없습니다"),
  clipIndex: z.number().positive(), // Use timestamp as unique identifier
  sessionId: z.string().min(1),
});

export const submissionSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  birthDate: z.string().min(1, "생년월일을 입력해주세요"),
  phone: z.string().regex(/^01[0-9]{8,9}$/, "올바른 휴대폰 번호를 입력해주세요"),
  subjectType: z.enum(["본인", "부모님", "형제자매", "친구", "기타"]).default("본인"),
  subjectOther: z.string().optional(),
  audioFiles: z.array(z.object({
    s3Key: z.string(),
    filename: z.string(),
    duration: z.number(),
    mimeType: z.string(),
    size: z.number(),
    clipIndex: z.number(),
  })).optional().default([]),
});

export const updateSubmissionSchema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "PROCESSING", "COMPLETED"]).optional(),
  adminNotes: z.string().optional(),
});

// Type exports
export type AudioUploadInput = z.infer<typeof audioUploadSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;
export type RegenerateSectionInput = z.infer<typeof regenerateSectionSchema>;
export type ExportRequestInput = z.infer<typeof exportRequestSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;
export type EventAudioUploadInput = z.infer<typeof eventAudioUploadSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
