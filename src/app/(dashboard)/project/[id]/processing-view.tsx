"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Mic, Brain, PenTool, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectProcessingViewProps {
  project: {
    id: string;
    title: string;
    jobs: Array<{
      id: string;
      type: string;
      status: string;
      progress: number;
    }>;
  };
}

const STAGES = [
  {
    type: "STT",
    label: "음성 인식",
    description: "녹음된 음성을 텍스트로 변환하고 있습니다",
    icon: Mic,
  },
  {
    type: "EXTRACT",
    label: "이야기 분석",
    description: "핵심 인물, 장소, 감정을 추출하고 있습니다",
    icon: Brain,
  },
  {
    type: "WRITE",
    label: "자서전 작성",
    description: "따뜻한 문체로 자서전을 작성하고 있습니다",
    icon: PenTool,
  },
];

export function ProjectProcessingView({ project }: ProjectProcessingViewProps) {
  const router = useRouter();
  const [pollCount, setPollCount] = useState(0);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPollCount((prev) => prev + 1);
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  // Calculate overall progress
  const getStageStatus = (type: string) => {
    const job = project.jobs.find((j) => j.type === type);
    if (!job) return "pending";
    if (job.status === "COMPLETED") return "completed";
    if (job.status === "PROCESSING") return "processing";
    if (job.status === "FAILED") return "failed";
    return "pending";
  };

  const getStageProgress = (type: string) => {
    const job = project.jobs.find((j) => j.type === type);
    return job?.progress || 0;
  };

  const overallProgress =
    STAGES.reduce((acc, stage) => {
      const status = getStageStatus(stage.type);
      if (status === "completed") return acc + 33.33;
      if (status === "processing") return acc + getStageProgress(stage.type) * 0.3333;
      return acc;
    }, 0);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-warm-900">{project.title}</h1>
        <p className="mt-2 text-warm-600">자서전을 생성하고 있습니다</p>
      </div>

      {/* Overall Progress */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-warm-600">전체 진행률</span>
            <span className="font-medium text-warm-900">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Stages */}
      <div className="space-y-4">
        {STAGES.map((stage, index) => {
          const status = getStageStatus(stage.type);
          const progress = getStageProgress(stage.type);
          const Icon = stage.icon;

          return (
            <Card
              key={stage.type}
              className={cn(
                "transition-all",
                status === "processing" && "border-primary/50 bg-primary/5",
                status === "completed" && "border-green-200 bg-green-50"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      status === "pending" && "bg-warm-100",
                      status === "processing" && "bg-primary/10",
                      status === "completed" && "bg-green-100",
                      status === "failed" && "bg-red-100"
                    )}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : status === "processing" ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          status === "failed" ? "text-red-600" : "text-warm-400"
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{stage.label}</CardTitle>
                    <CardDescription>{stage.description}</CardDescription>
                  </div>
                  {status === "processing" && (
                    <span className="text-sm font-medium text-primary">
                      {progress}%
                    </span>
                  )}
                </div>
              </CardHeader>
              {status === "processing" && (
                <CardContent className="pt-0">
                  <Progress value={progress} className="h-2" />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-warm-500">
        처리에는 10~30분이 소요될 수 있습니다.
        <br />
        이 페이지를 열어두시면 자동으로 업데이트됩니다.
      </p>
    </div>
  );
}
