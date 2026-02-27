"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kakaoChannelUrl?: string;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  kakaoChannelUrl = "http://pf.kakao.com/_xabkWn",
}: ConfirmationModalProps) {
  const handleKakaoClick = () => {
    window.open(kakaoChannelUrl, "_blank");
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            신청이 완료되었습니다
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed pt-4">
            신청이 완료되었습니다. 담당자가 곧 연락드릴게요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleKakaoClick}
          >
            <MessageCircle className="h-4 w-4" />
            카카오톡 상담하기
          </Button>
          <Button
            className="flex-1"
            onClick={handleClose}
          >
            연락 기다리기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
