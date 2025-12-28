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
  const durationRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sync duration to ref
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
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
      // Prevent multiple simultaneous recordings
      if (isRecording) {
        return;
      }

      // Cleanup any existing recording first
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyser for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Try formats in order of preference for STT compatibility
      const mimeTypes = [
        'audio/mp4',           // .m4a - best for STT
        'audio/webm;codecs=opus',
        'audio/webm',
      ];

      let selectedMimeType = 'audio/webm'; // fallback
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
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

        // Use durationRef to get the actual recorded duration
        onRecordingComplete(blob, durationRef.current);

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);
      durationRef.current = 0;

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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
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
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5 w-full">
      <CardContent className="flex flex-col items-center py-8 px-4 w-full overflow-hidden">
        {/* Recording indicator */}
        <div className="relative mb-6 flex items-center justify-center" style={{ width: '120px', height: '120px' }}>
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
                    transform: `scale(${1 + audioLevel * 0.15})`,
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
        <div className="flex gap-2 w-full justify-center max-w-sm">
          {!isRecording ? (
            <Button
              size="default"
              onClick={startRecording}
              disabled={disabled}
              className="gap-2 px-6 bg-[#43946C] hover:bg-[#367A5A] text-white"
            >
              <Mic className="h-4 w-4" />
              녹음 시작
            </Button>
          ) : (
            <>
              <Button
                size="default"
                variant="outline"
                onClick={pauseRecording}
                className="gap-1.5 px-4"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    계속
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    일시정지
                  </>
                )}
              </Button>
              <Button
                size="default"
                variant="destructive"
                onClick={stopRecording}
                className="gap-1.5 px-4"
              >
                <Square className="h-4 w-4" />
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
