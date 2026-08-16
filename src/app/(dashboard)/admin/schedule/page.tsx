"use client";

/**
 * 상담 불가 시간 관리 (시간표).
 *
 * 세로축이 시각, 가로축이 날짜인 주간 시간표다. 칸을 누르면 그 시간의 예약을
 * 막고, 다시 누르면 푼다.
 *
 * 왜 표인가
 * "이번 주 목요일 오후가 비어 있나"는 목록으로는 읽히지 않는다. 운영자는
 * 한 주를 한눈에 보고 빈 곳을 찾는다. 종이 시간표와 같은 배치를 그대로 쓴다.
 *
 * 모바일
 * 가로 스크롤 + 시각 열 고정. 7일을 억지로 좁혀 넣으면 칸이 손가락보다
 * 작아진다. 스크롤이 낫다.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, RotateCcw } from "lucide-react";

type CellState = "open" | "blocked" | "booked" | "past" | "closed";

interface Cell {
  startAt: string | null;
  state: CellState;
  bookedNames?: string[];
  reason?: string | null;
}

interface Day {
  dateKey: string;
  dayLabel: string;
  weekdayLabel: string;
  relativeLabel?: string;
  isClosed: boolean;
  holidayName?: string;
  openCount: number;
  blockedCount: number;
}

interface Timetable {
  days: Day[];
  times: string[];
  cells: Record<string, Record<string, Cell>>;
  fromDateKey: string;
  todayKey: string;
  maxAdvanceDays: number;
}

const DAY_COUNT = 7;

export default function SchedulePage() {
  const [data, setData] = useState<Timetable | null>(null);
  const [fromDateKey, setFromDateKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async (from: string | null) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ days: String(DAY_COUNT) });
      if (from) query.set("from", from);
      const response = await fetch(`/api/admin/slot-blocks?${query}`);
      if (!response.ok) throw new Error(String(response.status));
      const json = (await response.json()) as Timetable;
      setData(json);
      setFromDateKey(json.fromDateKey);
    } catch {
      setMessage("시간표를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(null);
  }, [load]);

  /** 낙관적 갱신 — 누른 즉시 색이 바뀌어야 조작감이 산다 */
  const applyLocally = useCallback(
    (startAts: string[], next: CellState) => {
      setData((current) => {
        if (!current) return current;
        const targets = new Set(startAts);
        const cells = { ...current.cells };
        for (const day of current.days) {
          const row = { ...cells[day.dateKey] };
          let changed = false;
          for (const clock of current.times) {
            const cell = row[clock];
            if (cell?.startAt && targets.has(cell.startAt)) {
              row[clock] = { ...cell, state: next, reason: null };
              changed = true;
            }
          }
          if (changed) cells[day.dateKey] = row;
        }
        return { ...current, cells };
      });
    },
    []
  );

  const mutate = useCallback(
    async (startAts: string[], action: "block" | "unblock") => {
      if (startAts.length === 0) return;

      setMessage(null);
      setPending((current) => new Set([...current, ...startAts]));
      applyLocally(startAts, action === "block" ? "blocked" : "open");

      try {
        const response = await fetch("/api/admin/slot-blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, startAts }),
        });
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json?.error ?? "변경하지 못했습니다.");

        if (json.skippedBooked > 0) {
          setMessage(`예약이 있는 ${json.skippedBooked}칸은 막지 않았습니다.`);
        }
      } catch (error) {
        // 서버가 거절했다. 화면을 진실(DB)에 다시 맞춘다.
        setMessage(error instanceof Error ? error.message : "변경하지 못했습니다.");
        void load(fromDateKey);
      } finally {
        setPending((current) => {
          const next = new Set(current);
          for (const id of startAts) next.delete(id);
          return next;
        });
      }
    },
    [applyLocally, fromDateKey, load]
  );

  const toggleCell = useCallback(
    (cell: Cell) => {
      if (!cell.startAt) return;
      if (cell.state === "booked" || cell.state === "past" || cell.state === "closed") return;
      void mutate([cell.startAt], cell.state === "blocked" ? "unblock" : "block");
    },
    [mutate]
  );

  /** 날짜 머리글 클릭 — 그 날 하루를 통째로 막거나 푼다 */
  const toggleDay = useCallback(
    (day: Day) => {
      if (!data || day.isClosed) return;
      const row = data.cells[day.dateKey] ?? {};
      const cells = data.times.map((clock) => row[clock]).filter(Boolean);

      // 막을 수 있는 칸이 하나라도 남아 있으면 "모두 막기",
      // 전부 막혀 있으면 "모두 풀기". 한 번 더 누르면 되돌아온다.
      const openings = cells.filter((c) => c.state === "open");
      if (openings.length > 0) {
        void mutate(openings.map((c) => c.startAt!).filter(Boolean), "block");
      } else {
        const blocked = cells.filter((c) => c.state === "blocked");
        void mutate(blocked.map((c) => c.startAt!).filter(Boolean), "unblock");
      }
    },
    [data, mutate]
  );

  /** 시각 행 머리글 클릭 — 이 주의 같은 시각을 통째로 */
  const toggleTime = useCallback(
    (clock: string) => {
      if (!data) return;
      const cells = data.days.map((d) => data.cells[d.dateKey]?.[clock]).filter(Boolean);
      const openings = cells.filter((c) => c.state === "open");
      if (openings.length > 0) {
        void mutate(openings.map((c) => c.startAt!).filter(Boolean), "block");
      } else {
        const blocked = cells.filter((c) => c.state === "blocked");
        void mutate(blocked.map((c) => c.startAt!).filter(Boolean), "unblock");
      }
    },
    [data, mutate]
  );

  const shiftWeek = useCallback(
    (direction: -1 | 1) => {
      if (!data) return;
      const base = new Date(`${data.fromDateKey}T00:00:00+09:00`);
      base.setDate(base.getDate() + direction * DAY_COUNT);
      const next = base.toISOString().slice(0, 10);
      void load(next);
    },
    [data, load]
  );

  const blockedTotal = useMemo(
    () => data?.days.reduce((sum, d) => sum + d.blockedCount, 0) ?? 0,
    [data]
  );

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>상담 불가 시간</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                칸을 누르면 그 시간의 예약을 막습니다. 다시 누르면 풀립니다.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => shiftWeek(-1)}
                disabled={isLoading}
                aria-label="이전 주"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => load(null)}
                disabled={isLoading}
              >
                이번 주
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shiftWeek(1)}
                disabled={isLoading}
                aria-label="다음 주"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => load(fromDateKey)}
                disabled={isLoading}
                aria-label="새로고침"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <Legend blockedTotal={blockedTotal} />

          {message && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {message}
            </p>
          )}

          {isLoading && !data ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              불러오는 중…
            </div>
          ) : data ? (
            <TimetableGrid
              data={data}
              pending={pending}
              onToggleCell={toggleCell}
              onToggleDay={toggleDay}
              onToggleTime={toggleTime}
            />
          ) : null}

          <p className="text-xs text-muted-foreground">
            날짜 또는 시각 머리글을 누르면 그 줄 전체를 한 번에 막거나 풉니다. 예약이
            이미 잡힌 칸은 막을 수 없습니다 — 먼저 신청 목록에서 정리해주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Legend({ blockedTotal }: { blockedTotal: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      <LegendItem className="bg-white ring-1 ring-inset ring-gray-300" label="예약 가능" />
      <LegendItem className="bg-rose-500" label="막음" />
      <LegendItem className="bg-blue-500" label="예약됨" />
      <LegendItem className="bg-gray-100" label="지난 시간" />
      <LegendItem className="bg-gray-50 ring-1 ring-inset ring-gray-200" label="휴무" />
      {blockedTotal > 0 && (
        <span className="text-muted-foreground">이 주에 {blockedTotal}칸 막힘</span>
      )}
    </div>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-3.5 w-3.5 rounded ${className}`} />
      {label}
    </span>
  );
}

function TimetableGrid({
  data,
  pending,
  onToggleCell,
  onToggleDay,
  onToggleTime,
}: {
  data: Timetable;
  pending: Set<string>;
  onToggleCell: (cell: Cell) => void;
  onToggleDay: (day: Day) => void;
  onToggleTime: (clock: string) => void;
}) {
  if (data.times.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">운영 시간이 없습니다.</p>;
  }

  return (
    // 모바일에서 7일을 좁혀 넣으면 칸이 손가락보다 작아진다. 가로 스크롤이 낫다.
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[560px] border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-background" />
            {data.days.map((day) => (
              <th key={day.dateKey} className="p-0 align-bottom">
                <button
                  type="button"
                  onClick={() => onToggleDay(day)}
                  disabled={day.isClosed}
                  title={day.isClosed ? "휴무" : "이 날 전체 막기 / 풀기"}
                  className={`w-full rounded-md px-1 py-1.5 text-center transition-colors ${
                    day.isClosed
                      ? "cursor-default text-gray-400"
                      : "hover:bg-gray-100 active:bg-gray-200"
                  }`}
                >
                  <span
                    className={`block text-[11px] leading-tight ${
                      day.weekdayLabel === "일" || day.holidayName
                        ? "text-rose-500"
                        : day.weekdayLabel === "토"
                          ? "text-blue-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {day.weekdayLabel}
                  </span>
                  <span
                    className={`block text-sm font-semibold leading-tight ${
                      data.todayKey === day.dateKey ? "text-primary" : ""
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                  {(day.relativeLabel || day.holidayName) && (
                    <span className="block truncate text-[10px] leading-tight text-muted-foreground">
                      {day.holidayName ?? day.relativeLabel}
                    </span>
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.times.map((clock) => (
            <tr key={clock}>
              <th className="sticky left-0 z-10 bg-background p-0 pr-1">
                <button
                  type="button"
                  onClick={() => onToggleTime(clock)}
                  title="이 시각 전체 막기 / 풀기"
                  className="w-14 rounded-md py-1 text-right text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:bg-gray-100 active:bg-gray-200"
                >
                  {clock}
                </button>
              </th>

              {data.days.map((day) => {
                const cell = data.cells[day.dateKey]?.[clock];
                if (!cell) return <td key={day.dateKey} />;
                return (
                  <td key={day.dateKey} className="p-0">
                    <SlotCell
                      cell={cell}
                      isPending={Boolean(cell.startAt && pending.has(cell.startAt))}
                      onClick={() => onToggleCell(cell)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CELL_STYLES: Record<CellState, string> = {
  open: "bg-white ring-1 ring-inset ring-gray-300 hover:ring-rose-400 hover:bg-rose-50 active:bg-rose-100",
  blocked: "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700",
  booked: "bg-blue-500 text-white cursor-not-allowed",
  past: "bg-gray-100 text-gray-400 cursor-not-allowed",
  closed: "bg-gray-50 ring-1 ring-inset ring-gray-200 cursor-not-allowed",
};

const CELL_TITLES: Record<CellState, string> = {
  open: "누르면 이 시간을 막습니다",
  blocked: "막힌 시간입니다. 누르면 풀립니다",
  booked: "이미 예약이 있습니다",
  past: "예약을 받을 수 없는 시간입니다",
  closed: "운영 시간이 아닙니다",
};

function SlotCell({
  cell,
  isPending,
  onClick,
}: {
  cell: Cell;
  isPending: boolean;
  onClick: () => void;
}) {
  const interactive = cell.state === "open" || cell.state === "blocked";
  const label =
    cell.state === "booked"
      ? (cell.bookedNames?.[0] ?? "예약")
      : cell.state === "blocked"
        ? "✕"
        : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive || isPending}
      title={cell.reason || CELL_TITLES[cell.state]}
      aria-label={`${cell.startAt ?? ""} ${CELL_TITLES[cell.state]}`}
      // 44px는 손가락으로 누를 수 있는 최소 크기다. 그 아래로 내려가면 오조작이 는다.
      className={`flex h-11 w-full items-center justify-center overflow-hidden rounded-md px-1 text-[11px] font-medium leading-none transition-colors ${
        CELL_STYLES[cell.state]
      } ${isPending ? "opacity-50" : ""}`}
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="truncate">{label}</span>}
    </button>
  );
}
