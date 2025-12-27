"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Pause, Play, Trash2, Volume2 } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  disabled?: boolean;
  maxDuration?: number; // in seconds
}

export function AudioRecorder({
  onRecordingComplete,
  disabled = false,
  maxDuration = 600, // 10 minutes default
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Auto-stop at max duration
  useEffect(() => {
    if (duration >= maxDuration && isRecording) {
      stopRecording();
    }
  }, [duration, maxDuration, isRecording]);

  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(average / 255);
    }
    if (isRecording && !isPaused) {
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio analyser for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        onRecordingComplete(blob, duration);

        // Cleanup
        stream.getTracks().forEach((track) => track.stop());
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Start audio level updates
      updateAudioLevel();
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("마이크 접근 권한이 필요합니다. 브라우저 설정을 확인해주세요.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
        updateAudioLevel();
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col items-center py-8">
        {/* Recording indicator */}
        <div className="relative mb-6">
          <div
            className={cn(
              "flex h-24 w-24 items-center justify-center rounded-full transition-all",
              isRecording
                ? isPaused
                  ? "bg-yellow-100"
                  : "bg-red-100"
                : "bg-primary/10"
            )}
            style={
              isRecording && !isPaused
                ? {
                    transform: `scale(${1 + audioLevel * 0.2})`,
                  }
                : undefined
            }
          >
            {isRecording ? (
              isPaused ? (
                <Pause className="h-10 w-10 text-yellow-600" />
              ) : (
                <div className="h-8 w-8 animate-pulse rounded-full bg-red-500" />
              )
            ) : (
              <Mic className="h-10 w-10 text-primary" />
            )}
          </div>

          {/* Audio level bars */}
          {isRecording && !isPaused && (
            <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary transition-all"
                  style={{
                    height: `${Math.max(4, audioLevel * (20 + i * 5))}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="mb-6 text-center">
          <p className="text-3xl font-mono font-semibold text-warm-900">
            {formatDuration(duration)}
          </p>
          <p className="text-sm text-warm-500">
            {isRecording
              ? isPaused
                ? "일시정지됨"
                : "녹음 중..."
              : "녹음 준비됨"}
          </p>
          {maxDuration && (
            <p className="mt-1 text-xs text-warm-400">
              최대 {formatDuration(maxDuration)}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isRecording ? (
            <Button
              size="lg"
              onClick={startRecording}
              disabled={disabled}
              className="gap-2"
            >
              <Mic className="h-5 w-5" />
              녹음 시작
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={pauseRecording}
                className="gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="h-5 w-5" />
                    계속
                  </>
                ) : (
                  <>
                    <Pause className="h-5 w-5" />
                    일시정지
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={stopRecording}
                className="gap-2"
              >
                <Square className="h-5 w-5" />
                녹음 완료
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Audio file card component
interface AudioFileCardProps {
  index: number;
  filename: string;
  duration: number;
  audioUrl?: string;
  onDelete: () => void;
  onPlay?: () => void;
}

export function AudioFileCard({
  index,
  filename,
  duration,
  audioUrl,
  onDelete,
}: AudioFileCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card className="bg-white">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Volume2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-warm-900">
              {filename || `녹음 #${index}`}
            </p>
            <p className="text-sm text-warm-500">{formatDuration(duration)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {audioUrl && (
            <>
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
