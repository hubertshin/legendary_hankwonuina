"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * 알림 발송 상태 표시 + 재발송.
 *
 * 발송이 조용히 실패하면 아무도 모른다. 실제로 API 키가 무효화된 동안 신청
 * 두 건의 알림이 유실됐고, 고객이 알려주기 전까지 알 수 없었다.
 *
 * 표시만 하고 재발송 수단이 없으면 반쪽이므로 버튼을 함께 둔다.
 */

interface Props {
  id: string;
  notifiedAt: string | null;
  notifyError: string | null;
  onChanged: () => void;
}

export function NotifyStatusCell({ id, notifiedAt, notifyError, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/submissions/resend-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? "재발송에 실패했습니다.");
        return;
      }
      onChanged();
    } catch {
      setError("네트워크 오류로 재발송하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (notifiedAt) {
    return (
      <span
        className="text-xs text-muted-foreground"
        title={new Date(notifiedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
      >
        발송됨
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <span
        className="inline-block rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-900"
        title={notifyError ?? "알림이 발송되지 않았습니다"}
      >
        메일 미발송
      </span>
      <button
        type="button"
        onClick={() => void resend()}
        disabled={busy}
        className="block text-xs underline text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        {busy ? (
          <span className="inline-flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> 발송 중
          </span>
        ) : (
          "다시 보내기"
        )}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
