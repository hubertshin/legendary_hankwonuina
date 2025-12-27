import { describe, it, expect } from "vitest";
import {
  formatDuration,
  formatFileSize,
  formatDate,
  parseTimestamp,
  isValidAudioType,
  truncate,
} from "@/lib/utils";

describe("formatDuration", () => {
  it("formats seconds to MM:SS", () => {
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(65)).toBe("01:05");
    expect(formatDuration(3599)).toBe("59:59");
  });

  it("formats hours correctly", () => {
    expect(formatDuration(3600)).toBe("01:00:00");
    expect(formatDuration(7261)).toBe("02:01:01");
  });
});

describe("formatFileSize", () => {
  it("formats bytes correctly", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(1073741824)).toBe("1 GB");
  });

  it("handles decimal values", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });
});

describe("parseTimestamp", () => {
  it("parses MM:SS format", () => {
    expect(parseTimestamp("00:00")).toBe(0);
    expect(parseTimestamp("01:30")).toBe(90);
    expect(parseTimestamp("10:00")).toBe(600);
  });

  it("parses HH:MM:SS format", () => {
    expect(parseTimestamp("01:00:00")).toBe(3600);
    expect(parseTimestamp("01:30:30")).toBe(5430);
  });
});

describe("isValidAudioType", () => {
  it("returns true for valid audio types", () => {
    expect(isValidAudioType("audio/mpeg")).toBe(true);
    expect(isValidAudioType("audio/wav")).toBe(true);
    expect(isValidAudioType("audio/m4a")).toBe(true);
  });

  it("returns false for invalid types", () => {
    expect(isValidAudioType("video/mp4")).toBe(false);
    expect(isValidAudioType("image/png")).toBe(false);
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
    expect(truncate("Hi", 10)).toBe("Hi");
  });
});
