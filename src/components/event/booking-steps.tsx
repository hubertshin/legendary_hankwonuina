"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { TRACKS, CALLER_ID_LABEL, type TrackId } from "@/lib/booking/config";
import type { DayView } from "@/lib/booking/slots";

/**
 * 상담 예약 3단계 (트랙 → 시간 → 연락처).
 *
 * 모바일 우선으로 만들었다. 주 사용자층이 중장년·시니어이고 유입 대부분이
 * 모바일이므로 터치 타깃 48px, 입력 필드 16px 이상(iOS 자동 확대 방지),
 * 날짜는 가로 스크롤로 처리한다.
 */

const GOLD = "#C9A84C";
const INK = "#1C1C1E";

export interface BookingResult {
  subjectType: string;
  preferredSlotAt: string | null;
  anyTimeOk: boolean;
  name: string;
  phone: string;
  consentPrivacy: boolean;
}

interface Props {
  onSubmit: (values: BookingResult) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string | null;
}

type Step = "track" | "time" | "contact";

export default function BookingSteps({ onSubmit, isSubmitting, errorMessage }: Props) {
  const [step, setStep] = useState<Step>("track");
  const [track, setTrack] = useState<TrackId | null>(null);

  const [days, setDays] = useState<DayView[]>([]);
  const [threshold, setThreshold] = useState(3);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [slotAt, setSlotAt] = useState<string | null>(null);
  const [anyTime, setAnyTime] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const response = await fetch("/api/event/slots", { cache: "no-store" });
      if (!response.ok) throw new Error("failed");
      const data = (await response.json()) as {
        days: DayView[];
        lowRemainingThreshold: number;
      };
      setDays(data.days);
      setThreshold(data.lowRemainingThreshold);
    } catch {
      setSlotsError("예약 가능 시간을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (step === "time" && days.length === 0 && !loadingSlots) void loadSlots();
  }, [step, days.length, loadingSlots, loadSlots]);

  const selectedTrack = TRACKS.find((t) => t.id === track);

  function handlePhone(value: string) {
    const numbers = value.replace(/[^\d]/g, "").slice(0, 11);
    const formatted =
      numbers.length <= 3
        ? numbers
        : numbers.length <= 7
          ? `${numbers.slice(0, 3)}-${numbers.slice(3)}`
          : `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    setPhone(formatted);
    setFieldError(null);
  }

  async function submit() {
    if (!name.trim()) {
      setFieldError("성함을 입력해주세요.");
      return;
    }
    if (!/^01[0-9]{8,9}$/.test(phone.replace(/[^\d]/g, ""))) {
      setFieldError("휴대폰 번호를 정확히 입력해주세요. (예: 010-1234-5678)");
      return;
    }
    if (!consent) {
      setFieldError("개인정보 수집·이용에 동의해주셔야 신청할 수 있습니다.");
      return;
    }
    setFieldError(null);

    await onSubmit({
      subjectType: selectedTrack?.subjectType ?? "본인",
      preferredSlotAt: anyTime ? null : slotAt,
      anyTimeOk: anyTime,
      name: name.trim(),
      phone,
      consentPrivacy: consent,
    });
  }

  return (
    <div>
      <StepBar step={step} />

      {step === "track" && (
        <StepTrack
          onSelect={(id) => {
            setTrack(id);
            setStep("time");
          }}
        />
      )}

      {step === "time" && (
        <StepTime
          days={days}
          threshold={threshold}
          loading={loadingSlots}
          error={slotsError}
          onRetry={() => void loadSlots()}
          onBack={() => setStep("track")}
          onPickSlot={(startAt) => {
            setSlotAt(startAt);
            setAnyTime(false);
            setStep("contact");
          }}
          onAnyTime={() => {
            setSlotAt(null);
            setAnyTime(true);
            setStep("contact");
          }}
        />
      )}

      {step === "contact" && (
        <StepContact
          whenLabel={anyTime ? null : slotAt ? formatWhen(slotAt) : null}
          name={name}
          phone={phone}
          consent={consent}
          onName={(v) => {
            setName(v);
            setFieldError(null);
          }}
          onPhone={handlePhone}
          onConsent={(v) => {
            setConsent(v);
            setFieldError(null);
          }}
          onBack={() => setStep("time")}
          onSubmit={() => void submit()}
          isSubmitting={isSubmitting}
          error={fieldError ?? errorMessage ?? null}
        />
      )}
    </div>
  );
}

/* ── STEP 1 ─────────────────────────────────────────────────────────── */

function StepTrack({ onSelect }: { onSelect: (id: TrackId) => void }) {
  return (
    <section>
      <h3
        className="text-xl md:text-2xl font-bold mb-2"
        style={{ color: INK, fontFamily: "var(--font-noto-serif)" }}
      >
        누구의 자서전인가요?
      </h3>
      <p className="text-base mb-6" style={{ color: "#666" }}>
        선택하신 내용에 맞춰 안내드릴게요.
      </p>

      {/* 모바일 1열, 데스크톱 2열 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TRACKS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className="flex flex-col items-start gap-2 rounded-2xl border-2 bg-white p-6 text-left transition active:scale-[0.99] hover:shadow-md min-h-[9rem]"
            style={{ borderColor: "#E5E0D6" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E5E0D6")}
          >
            <span aria-hidden className="text-4xl">
              {card.emoji}
            </span>
            <span
              className="whitespace-pre-line text-lg md:text-xl font-bold leading-snug"
              style={{ color: INK }}
            >
              {card.title}
            </span>
            <span className="text-base" style={{ color: "#888" }}>
              {card.caption}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ── STEP 2 ─────────────────────────────────────────────────────────── */

function StepTime({
  days,
  threshold,
  loading,
  error,
  onRetry,
  onBack,
  onPickSlot,
  onAnyTime,
}: {
  days: DayView[];
  threshold: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
  onPickSlot: (startAt: string) => void;
  onAnyTime: () => void;
}) {
  const openDays = useMemo(() => days.filter((d) => !d.isClosed), [days]);
  const firstOpen = openDays.find((d) => d.totalRemaining > 0)?.dateKey ?? null;
  const [selected, setSelected] = useState<string | null>(firstOpen);

  useEffect(() => {
    setSelected(firstOpen);
  }, [firstOpen]);

  const day = openDays.find((d) => d.dateKey === selected) ?? null;

  return (
    <section>
      <BackLink onClick={onBack} label="이전" />

      <h3
        className="text-xl md:text-2xl font-bold mb-5"
        style={{ color: INK, fontFamily: "var(--font-noto-serif)" }}
      >
        언제 전화드리면 편하실까요?
      </h3>

      {/* 선택 부담으로 이탈하는 층을 먼저 건진다 — 시간 목록보다 위에 둔다 */}
      <button
        type="button"
        onClick={onAnyTime}
        className="w-full flex items-center gap-3 rounded-2xl border-2 bg-white p-5 text-left mb-6 active:scale-[0.99] min-h-[3rem]"
        style={{ borderColor: GOLD }}
      >
        <span aria-hidden className="text-2xl">
          ☎️
        </span>
        <span>
          <span className="block text-lg font-bold" style={{ color: INK }}>
            아무 때나 괜찮아요
          </span>
          <span className="block text-base" style={{ color: "#888" }}>
            편한 시간에 연락드릴게요
          </span>
        </span>
      </button>

      {loading && (
        <p className="text-base" style={{ color: "#888" }}>
          예약 가능 시간을 불러오는 중…
        </p>
      )}

      {error && (
        <div role="alert" className="rounded-xl p-4 mb-4" style={{ backgroundColor: "#FDECEA" }}>
          <p style={{ color: "#C0392B" }}>{error}</p>
          <button type="button" onClick={onRetry} className="mt-2 underline text-base">
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && openDays.length > 0 && (
        <>
          <p className="font-bold mb-3" style={{ color: INK }}>
            또는 시간을 직접 골라주세요
          </p>

          {/* 날짜 칩 — 모바일 가로 스크롤 */}
          <div
            className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
            style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x proximity" }}
            role="tablist"
            aria-label="날짜 선택"
          >
            {openDays.map((d) => {
              const active = d.dateKey === selected;
              return (
                <button
                  key={d.dateKey}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelected(d.dateKey)}
                  className="flex-shrink-0 rounded-xl border-2 px-4 py-3 text-center min-w-[4.5rem] min-h-[3.75rem]"
                  style={{
                    borderColor: active ? GOLD : "#E5E0D6",
                    backgroundColor: active ? "#FBF6E9" : "#fff",
                    opacity: d.totalRemaining === 0 ? 0.45 : 1,
                    scrollSnapAlign: "start",
                  }}
                >
                  <span className="block text-sm" style={{ color: "#888" }}>
                    {d.relativeLabel ?? d.weekdayLabel}
                  </span>
                  <span className="block text-lg font-bold" style={{ color: INK }}>
                    {d.dayLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            {day === null || day.groups.length === 0 ? (
              <p
                className="rounded-xl border p-5 text-base"
                style={{ borderColor: "#E5E0D6", color: "#888", backgroundColor: "#fff" }}
              >
                이 날은 예약이 마감됐어요. 다른 날짜를 골라주세요.
              </p>
            ) : (
              <div className="space-y-5">
                {day.groups.map((group) => (
                  <div key={group.id}>
                    <h4 className="font-bold mb-2 text-base" style={{ color: "#888" }}>
                      {group.label}
                    </h4>
                    {/* 모바일 3열 / 데스크톱 4열 */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {group.slots.map((slot) => (
                        <button
                          key={slot.startAt}
                          type="button"
                          onClick={() => onPickSlot(slot.startAt)}
                          className="rounded-xl border-2 bg-white py-3 text-lg font-medium active:scale-[0.98] min-h-[3rem]"
                          style={{ borderColor: "#E5E0D6", color: INK }}
                        >
                          {slot.clock}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {day !== null && day.totalRemaining > 0 && day.totalRemaining <= threshold && (
              <p className="mt-4 text-base" style={{ color: "#B5965E" }}>
                ⓘ 이 날은 {day.totalRemaining}자리 남았어요
              </p>
            )}
          </div>
        </>
      )}

      {!loading && !error && openDays.length === 0 && (
        <p className="text-base" style={{ color: "#888" }}>
          지금은 선택 가능한 시간이 없습니다. &lsquo;아무 때나 괜찮아요&rsquo;로 신청해주세요.
        </p>
      )}
    </section>
  );
}

/* ── STEP 3 ─────────────────────────────────────────────────────────── */

function StepContact({
  whenLabel,
  name,
  phone,
  consent,
  onName,
  onPhone,
  onConsent,
  onBack,
  onSubmit,
  isSubmitting,
  error,
}: {
  whenLabel: string | null;
  name: string;
  phone: string;
  consent: boolean;
  onName: (v: string) => void;
  onPhone: (v: string) => void;
  onConsent: (v: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  return (
    <section>
      <BackLink onClick={onBack} label="시간 다시 고르기" />

      <div className="rounded-2xl border-2 p-5 mb-6" style={{ borderColor: GOLD, backgroundColor: "#fff" }}>
        <p className="text-lg md:text-xl font-bold" style={{ color: INK }}>
          {whenLabel ?? "편한 시간에 연락드릴게요"}
        </p>
        <p className="text-base mt-1" style={{ color: "#888" }}>
          {whenLabel
            ? `이 시간에 ${CALLER_ID_LABEL}로 전화드립니다`
            : "담당자가 확인 후 통화 시간을 안내드립니다"}
        </p>
      </div>

      <div className="space-y-5">
        <Field label="성함" required>
          <input
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            autoComplete="name"
            maxLength={40}
            className="w-full rounded-xl border-2 px-4 py-3"
            style={{ borderColor: "#E5E0D6", fontSize: "16px", minHeight: "3rem" }}
          />
        </Field>

        <Field label="휴대폰 번호" required hint="이 번호로 전화드립니다">
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            placeholder="010-1234-5678"
            autoComplete="tel"
            className="w-full rounded-xl border-2 px-4 py-3"
            style={{ borderColor: "#E5E0D6", fontSize: "16px", minHeight: "3rem" }}
          />
        </Field>

        <label
          className="flex items-start gap-3 cursor-pointer rounded-xl border p-4"
          style={{ borderColor: "#E5E0D6", backgroundColor: "#fff", minHeight: "3rem" }}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => onConsent(e.target.checked)}
            className="mt-0.5 h-6 w-6 flex-shrink-0"
            style={{ accentColor: GOLD }}
          />
          <span className="text-base leading-snug" style={{ color: INK }}>
            <strong style={{ color: "#C0392B" }}>(필수)</strong> 상담 진행을 위한 개인정보
            (성함·연락처) 수집·이용에 동의합니다.
          </span>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl p-4" style={{ backgroundColor: "#FDECEA", color: "#C0392B" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full mt-6 rounded-2xl py-4 text-lg font-bold text-white disabled:opacity-60 active:scale-[0.99]"
        style={{ backgroundColor: INK, minHeight: "3.5rem" }}
      >
        <span className="flex items-center justify-center">
          {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          신청하기
        </span>
      </button>
    </section>
  );
}

/* ── 공통 ───────────────────────────────────────────────────────────── */

function StepBar({ step }: { step: Step }) {
  const order: Step[] = ["track", "time", "contact"];
  const labels = ["누구의 자서전", "통화 시간", "연락처"];
  const current = order.indexOf(step);

  return (
    <ol className="flex items-center gap-2 mb-7 text-sm flex-wrap" aria-label="진행 단계">
      {order.map((_, index) => (
        <li key={index} className="flex items-center gap-1.5">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full font-bold text-white flex-shrink-0"
            style={{ backgroundColor: index <= current ? GOLD : "#D8D3C8" }}
            aria-current={index === current ? "step" : undefined}
          >
            {index + 1}
          </span>
          <span
            className="whitespace-nowrap"
            style={{ color: index === current ? INK : "#999", fontWeight: index === current ? 700 : 400 }}
          >
            {labels[index]}
          </span>
          {index < order.length - 1 && (
            <span aria-hidden style={{ color: "#D8D3C8" }}>
              —
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function BackLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 inline-flex items-center gap-1 text-base underline min-h-[2.5rem]"
      style={{ color: "#888" }}
    >
      <span aria-hidden>←</span> {label}
    </button>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold text-base" style={{ color: INK }}>
        {label}
        {required && <span style={{ color: "#C0392B" }}> *</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-base" style={{ color: "#888" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * 서버와 같은 결과를 내야 하므로 타임존을 명시한다.
 * 사용자 기기 타임존을 따라가면 해외 거주 자녀에게 다른 시각이 보인다.
 */
function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}
