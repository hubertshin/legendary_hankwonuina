"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Play, Download } from "lucide-react";
import { formatPhoneNumber } from "@/lib/event-utils";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

const statusLabels = {
  PENDING: "신청",
  PROCESSING: "작업중",
  CONTACTED: "연락완료",
  COMPLETED: "상담완료",
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
};

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [submission, setSubmission] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchSubmission();
  }, [params.id]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/admin/submissions/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setSubmission(data.submission);
      setStatus(data.submission.status);
      setAdminNotes(data.submission.adminNotes || "");
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast({
        title: "불러오기 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/submissions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast({
        title: "저장되었습니다",
      });

      fetchSubmission();
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({
        title: "저장 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getAudioUrl = async (s3Key: string, index: number) => {
    try {
      const encodedKey = encodeURIComponent(s3Key);
      const response = await fetch(`/api/admin/audio/${encodedKey}?action=stream`);

      if (!response.ok) throw new Error("Failed to get audio URL");

      const data = await response.json();
      setAudioUrls((prev) => ({ ...prev, [index]: data.url }));
    } catch (error) {
      console.error("Error getting audio URL:", error);
      toast({
        title: "오디오 로드 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (s3Key: string, filename: string) => {
    try {
      const encodedKey = encodeURIComponent(s3Key);
      const response = await fetch(
        `/api/admin/audio/${encodedKey}?action=download&filename=${encodeURIComponent(filename)}`
      );

      if (!response.ok) throw new Error("Failed to get download URL");

      const data = await response.json();
      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Error downloading audio:", error);
      toast({
        title: "다운로드 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">신청을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const audioFiles = Array.isArray(submission.audioFiles)
    ? submission.audioFiles
    : [];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/submissions">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{submission.name}</h1>
            <p className="text-muted-foreground">
              {new Date(submission.createdAt).toLocaleString("ko-KR")} 제출
            </p>
          </div>
          <Badge className={statusColors[submission.status as keyof typeof statusColors]}>
            {statusLabels[submission.status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </div>

      {/* Personal Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>신청자 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">이름</p>
              <p className="font-medium">{submission.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">생년월일</p>
              <p className="font-medium">
                {new Date(submission.birthDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">전화번호</p>
              <p className="font-medium">{formatPhoneNumber(submission.phone)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">자서전 주인공</p>
              <p className="font-medium">
                {submission.subjectType === "기타"
                  ? `기타 (${submission.subjectOther})`
                  : submission.subjectType}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Files */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>음성 파일 ({audioFiles.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {audioFiles.length === 0 ? (
            <p className="text-muted-foreground">음성 파일이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {audioFiles.map((file: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-warm-50 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">녹음 {file.clipIndex}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {file.filename}
                      </p>
                      {file.duration > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(file.duration / 60)}분{" "}
                          {Math.floor(file.duration % 60)}초
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => getAudioUrl(file.s3Key, index)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file.s3Key, file.filename)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {audioUrls[index] && (
                    <audio
                      src={audioUrls[index]}
                      controls
                      className="w-full"
                      controlsList="nodownload"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status & Notes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">상태</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">신청</SelectItem>
                <SelectItem value="PROCESSING">작업중</SelectItem>
                <SelectItem value="CONTACTED">연락완료</SelectItem>
                <SelectItem value="COMPLETED">상담완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">관리자 메모</label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="메모를 입력하세요..."
              rows={5}
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            저장
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
