"use client";

import { useState, useEffect } from "react";
import { Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

type Preset = "this-month" | "last-month" | "this-year" | "all" | "custom";

interface MonthVal {
  year: number;
  month: number; // 1-12
}

function getKSTNow(): MonthVal {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return { year: kst.getUTCFullYear(), month: kst.getUTCMonth() + 1 };
}

function toStr(v: MonthVal) {
  return `${v.year}-${String(v.month).padStart(2, "0")}`;
}

function cmp(a: MonthVal, b: MonthVal) {
  return a.year !== b.year ? a.year - b.year : a.month - b.month;
}

const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

// 인라인 월 범위 피커 (달력 스타일)
function MonthRangePicker({
  start,
  end,
  onChange,
}: {
  start: MonthVal;
  end: MonthVal;
  onChange: (start: MonthVal, end: MonthVal) => void;
}) {
  const now = getKSTNow();
  const [viewYear, setViewYear] = useState(start.year);
  // 0: 시작 선택 중, 1: 종료 선택 중
  const [step, setStep] = useState<0 | 1>(0);

  function handleMonthClick(month: number) {
    const clicked: MonthVal = { year: viewYear, month };
    if (step === 0) {
      onChange(clicked, clicked);
      setStep(1);
    } else {
      if (cmp(clicked, start) < 0) {
        // 시작보다 앞이면 시작으로 재설정
        onChange(clicked, clicked);
        setStep(1);
      } else {
        onChange(start, clicked);
        setStep(0);
      }
    }
  }

  function isStart(m: number) {
    return viewYear === start.year && m === start.month;
  }
  function isEnd(m: number) {
    return viewYear === end.year && m === end.month;
  }
  function isInRange(m: number) {
    const v: MonthVal = { year: viewYear, month: m };
    return cmp(v, start) > 0 && cmp(v, end) < 0;
  }
  function isStartEnd(m: number) {
    return isStart(m) || isEnd(m);
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* 선택 단계 표시 */}
      <div className="flex border-b border-border/40">
        <button
          onClick={() => setStep(0)}
          className={cn(
            "flex-1 py-2.5 text-[13px] font-medium transition-colors",
            step === 0 ? "text-primary border-b-2 border-primary -mb-px" : "text-muted-foreground"
          )}
        >
          시작: {start.year}년 {MONTH_LABELS[start.month - 1]}
        </button>
        <div className="w-px bg-border/40" />
        <button
          onClick={() => setStep(1)}
          className={cn(
            "flex-1 py-2.5 text-[13px] font-medium transition-colors",
            step === 1 ? "text-primary border-b-2 border-primary -mb-px" : "text-muted-foreground"
          )}
        >
          종료: {end.year}년 {MONTH_LABELS[end.month - 1]}
        </button>
      </div>

      {/* 연도 네비게이션 */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setViewYear((y) => y - 1)}
          disabled={viewYear <= 2020}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[15px] font-bold">{viewYear}년</span>
        <button
          onClick={() => setViewYear((y) => y + 1)}
          disabled={viewYear >= now.year + 1}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 월 그리드 */}
      <div className="grid grid-cols-4 gap-1.5 px-3 pb-4">
        {MONTH_LABELS.map((label, i) => {
          const m = i + 1;
          const selected = isStartEnd(m);
          const inRange = isInRange(m);
          const isS = isStart(m);
          const isE = isEnd(m);
          const isSame = cmp(start, end) === 0;

          return (
            <button
              key={m}
              onClick={() => handleMonthClick(m)}
              className={cn(
                "relative py-2.5 text-[13.5px] font-medium rounded-xl transition-colors",
                selected && "text-primary-foreground font-semibold",
                inRange && "bg-primary/15 text-primary rounded-none",
                // 범위 시작/끝 연결 처리
                isS && !isSame && "rounded-r-none",
                isE && !isSame && "rounded-l-none",
                selected && "bg-primary z-10",
                !selected && !inRange && "hover:bg-muted text-foreground"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ExportButton() {
  const now = getKSTNow();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<Preset>("this-month");
  const [customStart, setCustomStart] = useState<MonthVal>(now);
  const [customEnd, setCustomEnd] = useState<MonthVal>(now);
  const [loading, setLoading] = useState(false);

  // 뒤로가기 시 Drawer 닫기
  useEffect(() => {
    if (!open) return;
    history.pushState(null, "", window.location.href);
    const handlePop = () => setOpen(false);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [open]);

  function getRange(): { startMonth?: string; endMonth?: string } {
    const { year, month } = getKSTNow();
    switch (preset) {
      case "this-month":
        return { startMonth: toStr({ year, month }), endMonth: toStr({ year, month }) };
      case "last-month": {
        const lm = month === 1 ? 12 : month - 1;
        const ly = month === 1 ? year - 1 : year;
        return { startMonth: toStr({ year: ly, month: lm }), endMonth: toStr({ year: ly, month: lm }) };
      }
      case "this-year":
        return { startMonth: toStr({ year, month: 1 }), endMonth: toStr({ year, month: 12 }) };
      case "all":
        return {};
      case "custom":
        return { startMonth: toStr(customStart), endMonth: toStr(customEnd) };
    }
  }

  async function handleDownload() {
    setLoading(true);
    try {
      const range = getRange();
      const params = new URLSearchParams();
      if (range.startMonth) params.set("startMonth", range.startMonth);
      if (range.endMonth) params.set("endMonth", range.endMonth);

      const res = await fetch(`/api/export/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("내보내기 실패");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename\*=UTF-8''(.+)/);
      a.download = match ? decodeURIComponent(match[1]) : "가계부.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch {
      alert("내보내기 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const presets: { id: Preset; label: string }[] = [
    { id: "this-month", label: "이번 달" },
    { id: "last-month", label: "지난 달" },
    { id: "this-year", label: "올해" },
    { id: "all", label: "전체 기간" },
    { id: "custom", label: "직접 선택" },
  ];

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button className="flex w-full items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
              <Download className="h-4 w-4 text-foreground/70" />
            </div>
            <span className="text-[14.5px] font-medium">엑셀 내보내기</span>
          </div>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[20px] bg-background border-t border-border max-h-[90vh]">
          {/* 핸들 */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-9 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-3 shrink-0">
            <Drawer.Title className="text-[16px] font-bold">내보낼 기간 선택</Drawer.Title>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="px-4 pb-8 space-y-4 overflow-y-auto">
            {/* 프리셋 버튼 */}
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  className={cn(
                    "py-3 rounded-xl text-[13.5px] font-medium border transition-colors",
                    preset === p.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border/60 hover:bg-muted/50"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 직접 선택: 인라인 월 달력 */}
            {preset === "custom" && (
              <MonthRangePicker
                start={customStart}
                end={customEnd}
                onChange={(s, e) => {
                  setCustomStart(s);
                  setCustomEnd(e);
                }}
              />
            )}

            {/* 다운로드 버튼 */}
            <button
              onClick={handleDownload}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground text-[15px] font-semibold disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? "내보내는 중..." : "엑셀 파일 다운로드"}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
