"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Check } from "lucide-react";

/**
 * 목록에서 통화 결과와 메모를 바로 남기는 셀.
 *
 * 상세 페이지로 들어갔다 나오게 하면 상담사가 기록을 안 남긴다. 전화를 끊은
 * 직후 한 번의 클릭으로 끝나야 실제로 쌓인다.
 *
 * 메모는 자동 저장한다(입력 멈춤 후 800ms). 저장 버튼을 두면 누르지 않고
 * 넘어가 기록이 사라진다.
 */

export type CallResult = "CONNECTED" | "NO_ANSWER" | "CALLBACK_REQUESTED" | null;

const OPTIONS: { value: Exclude<CallResult, null>; label: string; tone: string }[] = [
  { value: "CONNECTED", label: "통화함", tone: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  { value: "NO_ANSWER", label: "부재", tone: "bg-amber-100 text-amber-900 border-amber-300" },
  { value: "CALLBACK_REQUESTED", label: "재통화", tone: "bg-sky-100 text-sky-900 border-sky-300" },
];

interface Props {
  id: string;
  callResult: CallResult;
  calledAt: string | null;
  adminNotes: string | null;
  onChanged: () => void;
}

export function CallLogCell({ id, callResult, calledAt, adminNotes, onChanged }: Props) {
  const [result, setResult] = useState<CallResult>(callResult);
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error ?? "저장하지 못했습니다.");
        return false;
      }
      setSavedAt(Date.now());
      onChanged();
      return true;
    } catch {
      setError("네트워크 오류로 저장되지 않았습니다.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function pick(value: Exclude<CallResult, null>) {
    // 같은 버튼을 다시 누르면 해제 — 잘못 누른 것을 되돌릴 수단이 필요하다
    const next: CallResult = result === value ? null : value;
    setResult(next);
    void patch({ callResult: next });
  }

  // 메모 자동 저장 (디바운스)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void patch({ adminNotes: notes });
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  const justSaved = savedAt !== null && Date.now() - savedAt < 2500;

  return (
    <div className="min-w-[15rem] space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={saving}
            onClick={() => pick(option.value)}
            className={[
              "rounded-full border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50",
              result === option.value ? option.tone : "border-muted bg-background text-muted-foreground hover:bg-muted",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        {!saving && justSaved && <Check className="h-3.5 w-3.5 text-emerald-600" />}
      </div>

      {calledAt && result && (
        <p className="text-xs text-muted-foreground">
          {new Date(calledAt).toLocaleString("ko-KR", {
            timeZone: "Asia/Seoul",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          기록
        </p>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="메모 (자동 저장)"
        rows={2}
        maxLength={5000}
        className="w-full resize-y rounded-md border bg-background px-2 py-1.5 text-sm"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
