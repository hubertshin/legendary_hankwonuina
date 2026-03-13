"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  phone: string;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function SubmitReviewModal({
  open,
  onOpenChange,
  name,
  birthYear,
  birthMonth,
  birthDay,
  phone,
  isSubmitting,
  onConfirm,
}: SubmitReviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-2" style={{ color: "#1C1C1E" }}>
            입력하신 내용이 맞나요?
          </DialogTitle>
        </DialogHeader>

        <p className="text-center text-base mb-6" style={{ color: "#888" }}>
          아래 내용을 확인하시고 맞으면 신청 버튼을 눌러주세요
        </p>

        <div
          className="rounded-2xl p-6 space-y-4 mb-6"
          style={{ backgroundColor: "#F8F5EF", border: "1px solid #E8DFC8" }}
        >
          <div className="flex items-center gap-4">
            <span className="text-base font-semibold w-24 flex-shrink-0" style={{ color: "#888" }}>이름</span>
            <span className="text-xl font-bold" style={{ color: "#1C1C1E" }}>{name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base font-semibold w-24 flex-shrink-0" style={{ color: "#888" }}>생년월일</span>
            <span className="text-xl font-bold" style={{ color: "#1C1C1E" }}>
              {birthYear}년 {birthMonth}월 {birthDay}일
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base font-semibold w-24 flex-shrink-0" style={{ color: "#888" }}>전화번호</span>
            <span className="text-xl font-bold" style={{ color: "#1C1C1E" }}>{phone}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full text-white font-bold rounded-xl"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #b8923e)",
              border: "none",
              fontSize: "1.25rem",
              padding: "1.1rem",
            }}
          >
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            네, 맞습니다. 신청할게요!
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full rounded-xl"
            style={{ fontSize: "1.1rem", padding: "1rem" }}
          >
            다시 수정할게요
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
