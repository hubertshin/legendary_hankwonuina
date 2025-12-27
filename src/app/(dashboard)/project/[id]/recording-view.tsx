"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecordingGuidelines } from "@/components/recording/guidelines";
import { QuestionPanel } from "@/components/recording/question-panel";
import { AudioRecorder, AudioFileCard } from "@/components/recording/audio-recorder";
import { FileUploader } from "@/components/recording/file-uploader";
import { Mic, Upload, Send, Loader2, AlertCircle } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface AudioClip {
  id: string;
  clipIndex: number;
  filename: string;
  duration: number;
  blob?: Blob;
  file?: File;
  audioUrl?: string;
  isUploaded?: boolean;
}

interface ProjectRecordingViewProps {
  project: {
    id: string;
    title: string;
    audioAssets: Array<{
      id: string;
      clipIndex: number;
      originalName: string;
      duration: number | null;
      s3Url: string | null;
    }>;
  };
}

const MAX_CLIPS = 3;

export function ProjectRecordingView({ project }: ProjectRecordingViewProps) {
  const router = useRouter();
  const [clips, setClips] = useState<AudioClip[]>(
    project.audioAssets.map((asset) => ({
      id: asset.id,
      clipIndex: asset.clipIndex,
      filename: asset.originalName,
      duration: asset.duration || 0,
      audioUrl: asset.s3Url || undefined,
      isUploaded: true,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAddMore = clips.length < MAX_CLIPS;
  const hasClips = clips.length > 0;

  const handleRecordingComplete = useCallback(
    (blob: Blob, duration: number) => {
      if (!canAddMore) return;

      const newClipIndex = clips.length + 1;
      const newClip: AudioClip = {
        id: `temp-${Date.now()}`,
        clipIndex: newClipIndex,
        filename: `녹음 #${newClipIndex}`,
        duration,
        blob,
        audioUrl: URL.createObjectURL(blob),
      };

      setClips((prev) => [...prev, newClip]);
    },
    [clips.length, canAddMore]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!canAddMore) return;

      // Create audio element to get duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);

      audio.onloadedmetadata = () => {
        const newClipIndex = clips.length + 1;
        const newClip: AudioClip = {
          id: `temp-${Date.now()}`,
          clipIndex: newClipIndex,
          filename: file.name,
          duration: audio.duration,
          file,
          audioUrl: audio.src,
        };

        setClips((prev) => [...prev, newClip]);
      };
    },
    [clips.length, canAddMore]
  );

  const handleDeleteClip = useCallback((clipId: string) => {
    setClips((prev) => {
      const filtered = prev.filter((c) => c.id !== clipId);
      // Re-index clips
      return filtered.map((c, index) => ({
        ...c,
        clipIndex: index + 1,
      }));
    });
  }, []);

  const handleSubmit = async () => {
    if (!hasClips) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload each clip
      for (const clip of clips) {
        if (clip.isUploaded) continue;

        const fileToUpload = clip.blob || clip.file;
        if (!fileToUpload) continue;

        // Get presigned URL
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            clipIndex: clip.clipIndex,
            filename: clip.filename,
            contentType: fileToUpload.type || "audio/webm",
            size: fileToUpload.size,
          }),
        });

        if (!presignRes.ok) {
          throw new Error("Failed to get upload URL");
        }

        const { uploadUrl, audioAssetId } = await presignRes.json();

        // Upload to S3
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: fileToUpload,
          headers: {
            "Content-Type": fileToUpload.type || "audio/webm",
          },
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file");
        }

        // Confirm upload
        await fetch("/api/upload/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioAssetId,
            duration: clip.duration,
          }),
        });
      }

      // Submit project for processing
      const submitRes = await fetch("/api/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (!submitRes.ok) {
        throw new Error("Failed to submit project");
      }

      // Refresh the page to show processing view
      router.refresh();
    } catch (err) {
      console.error("Submit error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "제출 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-900">{project.title}</h1>
        <p className="text-warm-600">음성을 녹음하여 자서전을 만들어보세요</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Recording Area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Guidelines */}
          <RecordingGuidelines />

          {/* Recording/Upload Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>음성 녹음</span>
                <span className="text-sm font-normal text-warm-500">
                  {clips.length}/{MAX_CLIPS} 클립
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="record" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="record" className="gap-2">
                    <Mic className="h-4 w-4" />
                    녹음하기
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="h-4 w-4" />
                    파일 업로드
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="record" className="mt-4">
                  <AudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                    disabled={!canAddMore}
                    maxDuration={600}
                  />
                  {!canAddMore && (
                    <p className="mt-3 text-center text-sm text-warm-500">
                      최대 {MAX_CLIPS}개의 녹음을 추가할 수 있습니다
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="upload" className="mt-4">
                  <FileUploader
                    onFileSelect={handleFileSelect}
                    disabled={!canAddMore}
                  />
                  {!canAddMore && (
                    <p className="mt-3 text-center text-sm text-warm-500">
                      최대 {MAX_CLIPS}개의 파일을 추가할 수 있습니다
                    </p>
                  )}
                </TabsContent>
              </Tabs>

              {/* Clips List */}
              {clips.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-warm-800">녹음된 클립</h4>
                  {clips.map((clip) => (
                    <AudioFileCard
                      key={clip.id}
                      index={clip.clipIndex}
                      filename={clip.filename}
                      duration={clip.duration}
                      audioUrl={clip.audioUrl}
                      onDelete={() => handleDeleteClip(clip.id)}
                    />
                  ))}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleSubmit}
                disabled={!hasClips || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    자서전 생성 시작
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Question Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <QuestionPanel projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
