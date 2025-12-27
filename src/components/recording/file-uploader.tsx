"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileAudio } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

const DEFAULT_MAX_SIZE = 200 * 1024 * 1024; // 200MB
const DEFAULT_ACCEPTED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/x-m4a",
  "audio/mp4",
];

export function FileUploader({
  onFileSelect,
  disabled = false,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: acceptedTypes.reduce(
        (acc, type) => ({ ...acc, [type]: [] }),
        {}
      ),
      maxSize,
      maxFiles: 1,
      disabled,
    });

  const errorMessage = fileRejections[0]?.errors[0]?.message;

  return (
    <div
      {...getRootProps()}
      className={cn(
        "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-warm-200 hover:border-primary/50",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center">
        <div
          className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-colors",
            isDragActive ? "bg-primary/10" : "bg-warm-100"
          )}
        >
          {isDragActive ? (
            <FileAudio className="h-7 w-7 text-primary" />
          ) : (
            <Upload className="h-7 w-7 text-warm-500" />
          )}
        </div>

        {isDragActive ? (
          <p className="text-lg font-medium text-primary">
            파일을 여기에 놓으세요
          </p>
        ) : (
          <>
            <p className="mb-1 text-lg font-medium text-warm-800">
              파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-sm text-warm-500">
              m4a, mp3, wav 지원 (최대 {formatFileSize(maxSize)})
            </p>
          </>
        )}

        {errorMessage && (
          <p className="mt-3 text-sm text-destructive">
            {errorMessage === "File is larger than 209715200 bytes"
              ? `파일 크기는 ${formatFileSize(maxSize)}를 초과할 수 없습니다`
              : "지원하지 않는 파일 형식입니다"}
          </p>
        )}
      </div>
    </div>
  );
}
