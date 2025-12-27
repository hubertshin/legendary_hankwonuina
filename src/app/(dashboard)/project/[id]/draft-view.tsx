"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Edit,
  RefreshCw,
  Lock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Chapter {
  title: string;
  content: string;
  citations?: string[];
  uncertainParts?: string[];
}

interface ProjectDraftViewProps {
  project: {
    id: string;
    title: string;
    status: string;
    drafts: Array<{
      id: string;
      title: string;
      chapters: unknown;
      content: string;
      pageCount: number;
      wordCount: number;
    }>;
    payment: {
      status: string;
    } | null;
  };
}

const FREE_PREVIEW_PAGES = 2;

export function ProjectDraftView({ project }: ProjectDraftViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "docx" | null>(null);
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const draft = project.drafts[0];
  const isPaid = project.payment?.status === "COMPLETED";
  const chapters = (draft?.chapters as Chapter[]) || [];
  const totalPages = chapters.length;

  const canViewPage = (pageIndex: number) => {
    return isPaid || pageIndex < FREE_PREVIEW_PAGES;
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!isPaid) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsExporting(format);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          format,
        }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("내보내기에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleRegenerate = async () => {
    if (editingChapter === null || !feedback.trim()) return;

    setIsRegenerating(true);
    try {
      const res = await fetch("/api/drafts/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId: draft.id,
          chapterIndex: editingChapter,
          feedback,
        }),
      });

      if (!res.ok) throw new Error("Regenerate failed");

      // Refresh page
      window.location.reload();
    } catch (error) {
      console.error("Regenerate error:", error);
      alert("재생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsRegenerating(false);
      setEditingChapter(null);
      setFeedback("");
    }
  };

  if (project.status === "FAILED") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-warm-900">처리 실패</h1>
        <p className="mt-2 text-warm-600">
          자서전 생성 중 오류가 발생했습니다.
        </p>
        <Link href="/dashboard">
          <Button className="mt-6">대시보드로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-warm-600">자서전을 불러오는 중...</p>
      </div>
    );
  }

  const currentChapter = chapters[currentPage];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">{draft.title}</h1>
          <p className="text-warm-600">
            {draft.pageCount}페이지 · {draft.wordCount.toLocaleString()}자
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("docx")}
            disabled={isExporting !== null}
            className="gap-2"
          >
            {isExporting === "docx" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            DOCX
            {!isPaid && <Lock className="h-3 w-3" />}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={isExporting !== null}
            className="gap-2"
          >
            {isExporting === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF
            {!isPaid && <Lock className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Free preview notice */}
      {!isPaid && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-warm-900">
                  무료 미리보기: 처음 {FREE_PREVIEW_PAGES}페이지
                </p>
                <p className="text-sm text-warm-600">
                  전체 자서전을 보려면 결제가 필요합니다
                </p>
              </div>
            </div>
            <Button onClick={() => setIsPaymentModalOpen(true)}>
              전체 열람하기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Chapter Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {chapters.map((chapter, index) => (
            <Button
              key={index}
              variant={currentPage === index ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (canViewPage(index)) {
                  setCurrentPage(index);
                } else {
                  setIsPaymentModalOpen(true);
                }
              }}
              className={cn(
                "whitespace-nowrap",
                !canViewPage(index) && "opacity-60"
              )}
            >
              {!canViewPage(index) && <Lock className="mr-1 h-3 w-3" />}
              {chapter.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Draft Content */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{currentChapter?.title}</CardTitle>
          {isPaid && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingChapter(currentPage)}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              재생성
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {canViewPage(currentPage) ? (
            <div
              className="draft-content prose prose-warm max-w-none"
              dangerouslySetInnerHTML={{
                __html: currentChapter?.content
                  .replace(
                    /\[(\d{2}:\d{2}(?::\d{2})?–\d{2}:\d{2}(?::\d{2})?)\]/g,
                    '<span class="citation">[$1]</span>'
                  )
                  .replace(
                    /\{불확실\}/g,
                    '<span class="uncertain">추론된 내용</span>'
                  ) || "",
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Lock className="mb-4 h-12 w-12 text-warm-300" />
              <p className="text-lg font-medium text-warm-700">
                이 페이지는 잠겨 있습니다
              </p>
              <p className="mt-2 text-warm-500">
                전체 자서전을 보려면 결제가 필요합니다
              </p>
              <Button className="mt-4" onClick={() => setIsPaymentModalOpen(true)}>
                전체 열람하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </Button>

        <span className="text-warm-600">
          {currentPage + 1} / {totalPages}
        </span>

        <Button
          variant="outline"
          onClick={() => {
            if (canViewPage(currentPage + 1)) {
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
            } else {
              setIsPaymentModalOpen(true);
            }
          }}
          disabled={currentPage === totalPages - 1}
          className="gap-2"
        >
          다음
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>전체 자서전 열람</DialogTitle>
            <DialogDescription>
              전체 {totalPages}페이지의 자서전과 다운로드 기능을 이용하세요
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-6 rounded-lg bg-warm-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-warm-700">자서전 전체 열람</span>
                <span className="text-2xl font-bold text-warm-900">₩29,000</span>
              </div>
              <ul className="space-y-2 text-sm text-warm-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  전체 {totalPages}페이지 열람
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  PDF + DOCX 다운로드
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  섹션별 재생성 기능
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  영구 저장
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement Stripe payment
                alert("결제 기능은 준비 중입니다.");
              }}
            >
              결제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Modal */}
      <Dialog
        open={editingChapter !== null}
        onOpenChange={(open) => !open && setEditingChapter(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>섹션 재생성</DialogTitle>
            <DialogDescription>
              이 섹션을 어떻게 수정하고 싶으신가요?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="예: 더 자세하게 써주세요, 어머니와의 에피소드를 추가해주세요"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingChapter(null)}
              disabled={isRegenerating}
            >
              취소
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={!feedback.trim() || isRegenerating}
              className="gap-2"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  재생성 중...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  재생성
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
