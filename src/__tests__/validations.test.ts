import { describe, it, expect } from "vitest";
import {
  audioUploadSchema,
  createProjectSchema,
  exportRequestSchema,
} from "@/lib/validations";

describe("audioUploadSchema", () => {
  it("validates correct audio upload data", () => {
    const validData = {
      filename: "recording.mp3",
      contentType: "audio/mpeg",
      size: 1024 * 1024, // 1MB
      clipIndex: 1,
    };

    expect(() => audioUploadSchema.parse(validData)).not.toThrow();
  });

  it("rejects files over 200MB", () => {
    const invalidData = {
      filename: "recording.mp3",
      contentType: "audio/mpeg",
      size: 201 * 1024 * 1024,
      clipIndex: 1,
    };

    expect(() => audioUploadSchema.parse(invalidData)).toThrow();
  });

  it("rejects invalid content types", () => {
    const invalidData = {
      filename: "video.mp4",
      contentType: "video/mp4",
      size: 1024 * 1024,
      clipIndex: 1,
    };

    expect(() => audioUploadSchema.parse(invalidData)).toThrow();
  });

  it("rejects clip index > 3", () => {
    const invalidData = {
      filename: "recording.mp3",
      contentType: "audio/mpeg",
      size: 1024 * 1024,
      clipIndex: 4,
    };

    expect(() => audioUploadSchema.parse(invalidData)).toThrow();
  });
});

describe("createProjectSchema", () => {
  it("validates with optional title", () => {
    expect(() => createProjectSchema.parse({})).not.toThrow();
    expect(() => createProjectSchema.parse({ title: "My Book" })).not.toThrow();
  });

  it("rejects titles over 100 characters", () => {
    const longTitle = "a".repeat(101);
    expect(() => createProjectSchema.parse({ title: longTitle })).toThrow();
  });
});

describe("exportRequestSchema", () => {
  it("validates correct export request", () => {
    const validData = {
      projectId: "clj1234567890abcdefghij",
      format: "pdf" as const,
    };

    expect(() => exportRequestSchema.parse(validData)).not.toThrow();
  });

  it("rejects invalid format", () => {
    const invalidData = {
      projectId: "clj1234567890abcdefghij",
      format: "txt",
    };

    expect(() => exportRequestSchema.parse(invalidData)).toThrow();
  });
});
