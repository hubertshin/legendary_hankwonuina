"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  Clock,
  MicOff,
  MessageCircle,
  Lightbulb,
} from "lucide-react";

export function RecordingGuidelines() {
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
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-warm-900">
            <Lightbulb className="h-5 w-5 text-primary" />
            가이드라인
          </h3>
          <p className="text-warm-700">
            이 음성파일에 들리는 것처럼 나의 어린시절 이야기를 가족에게 말해주듯
            음성을 녹음해주세요.
          </p>
        </div>

        {/* Example Audio Player */}
        <div className="mb-6 rounded-lg bg-white p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              className="h-12 w-12 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 pl-0.5" />
              )}
            </Button>
            <div className="flex-1">
              <p className="font-medium text-warm-800">예시 듣기</p>
              <p className="text-sm text-warm-500">
                샘플 녹음을 들어보세요
              </p>
            </div>
            <Volume2 className="h-5 w-5 text-warm-400" />
          </div>
          <audio
            ref={audioRef}
            src="/audio/sample-recording.mp3"
            onEnded={() => setIsPlaying(false)}
          />
        </div>

        {/* Tips */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-warm-800">권장 녹음 시간</p>
              <p className="text-sm text-warm-600">
                각 녹음은 3~10분 정도가 적당합니다
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MicOff className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-warm-800">조용한 환경</p>
              <p className="text-sm text-warm-600">
                주변 소음이 적은 곳에서 녹음해주세요
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-warm-800">자연스럽게</p>
              <p className="text-sm text-warm-600">
                완벽한 말투는 필요 없어요. 편하게 이야기해주세요
              </p>
            </div>
          </div>
        </div>

        {/* Recording instruction */}
        <div className="mt-6 rounded-lg bg-white p-4">
          <p className="text-center text-warm-700">
            <span className="font-medium">녹음 안내:</span> 아래 버튼을 눌러
            음성 녹음을 시작하세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
