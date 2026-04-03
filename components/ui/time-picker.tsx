"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const ITEM_H = 48;
const VISIBLE = 5; // 홀수여야 선택 항목이 정중앙에 위치
const PAD = Math.floor(VISIBLE / 2); // 위아래 패딩 개수

function DrumPicker({
  items,
  selected,
  onSelect,
  fmt = (v: number) => String(v),
}: {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
  fmt?: (v: number) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const lastIndex = useRef(items.indexOf(selected));

  const scrollToIndex = useCallback(
    (idx: number, smooth = true) => {
      if (!ref.current) return;
      ref.current.scrollTo({
        top: idx * ITEM_H,
        behavior: smooth ? "smooth" : "instant",
      });
    },
    []
  );

  // 외부 value 변경 시 스크롤 동기화
  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx === -1) return;
    if (lastIndex.current !== idx) {
      lastIndex.current = idx;
      scrollToIndex(idx, false);
    }
  }, [selected, items, scrollToIndex]);

  // 초기 위치 설정
  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx === -1) return;
    scrollToIndex(idx, false);
    lastIndex.current = idx;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const snapToNearest = useCallback(() => {
    if (!ref.current) return;
    const raw = ref.current.scrollTop;
    const idx = Math.round(raw / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    scrollToIndex(clamped, true);
    lastIndex.current = clamped;
    onSelect(items[clamped]);
  }, [items, onSelect, scrollToIndex]);

  const handleScroll = useCallback(() => {
    isScrolling.current = true;
  }, []);

  // touchend / mouseup 이후 스냅
  const handleScrollEnd = useCallback(() => {
    if (!isScrolling.current) return;
    isScrolling.current = false;
    snapToNearest();
  }, [snapToNearest]);

  // scrollend 미지원 브라우저(Android WebView) 대응: 타이머로 처리
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      clearTimeout(timer);
      isScrolling.current = true;
      timer = setTimeout(() => {
        isScrolling.current = false;
        snapToNearest();
      }, 120);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [snapToNearest]);

  // 항목 직접 탭으로 선택
  const handleItemClick = (idx: number) => {
    lastIndex.current = idx;
    onSelect(items[idx]);
    scrollToIndex(idx, true);
  };

  return (
    <div className="relative flex-1" style={{ height: ITEM_H * VISIBLE }}>
      {/* 상단/하단 페이드 마스크 */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: ITEM_H * PAD,
          background:
            "linear-gradient(to bottom, var(--background) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: ITEM_H * PAD,
          background:
            "linear-gradient(to top, var(--background) 0%, transparent 100%)",
        }}
      />

      {/* 선택 영역 하이라이트 */}
      <div
        className="absolute inset-x-3 z-0 pointer-events-none rounded-xl bg-muted/60"
        style={{ top: ITEM_H * PAD, height: ITEM_H }}
      />

      {/* 스크롤 드럼 */}
      <div
        ref={ref}
        onScroll={handleScroll}
        onTouchEnd={handleScrollEnd}
        className="absolute inset-0 overflow-y-scroll overscroll-none"
        style={{ scrollbarWidth: "none" }}
      >
        {/* 상단 패딩 */}
        {Array.from({ length: PAD }).map((_, i) => (
          <div key={`pt${i}`} style={{ height: ITEM_H }} />
        ))}

        {items.map((item, idx) => (
          <div
            key={item}
            style={{ height: ITEM_H }}
            className={cn(
              "flex items-center justify-center select-none transition-all duration-150 cursor-pointer",
              item === selected
                ? "text-foreground text-[20px] font-bold"
                : "text-muted-foreground/50 text-[17px] font-medium"
            )}
            onClick={() => handleItemClick(idx)}
          >
            {fmt(item)}
          </div>
        ))}

        {/* 하단 패딩 */}
        {Array.from({ length: PAD }).map((_, i) => (
          <div key={`pb${i}`} style={{ height: ITEM_H }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 공개 컴포넌트
// ─────────────────────────────────────────────────────────

interface TimePickerProps {
  value: string; // "HH:mm" 24시 형식
  onChange: (value: string) => void;
  className?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1~12
const MINUTES = Array.from({ length: 60 }, (_, i) => i);   // 0~59

function parse(val: string) {
  const [h, m] = val.split(":").map(Number);
  const hour24 = isNaN(h) ? 0 : h;
  const minute = isNaN(m) ? 0 : m;
  const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  return { period, hour12, minute };
}

function to24(period: "AM" | "PM", hour12: number, minute: number): string {
  let h = hour12;
  if (period === "AM" && h === 12) h = 0;
  else if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const { period, hour12, minute } = parse(value);

  const [open, setOpen] = useState(false);
  const [selPeriod, setSelPeriod] = useState<"AM" | "PM">(period);
  const [selHour, setSelHour] = useState(hour12);
  const [selMin, setSelMin] = useState(minute);

  // open 시 현재 value로 초기화
  const handleOpen = () => {
    const p = parse(value);
    setSelPeriod(p.period);
    setSelHour(p.hour12);
    setSelMin(p.minute);
    setOpen(true);
  };

  const handleConfirm = () => {
    onChange(to24(selPeriod, selHour, selMin));
    setOpen(false);
  };

  // 표시용 레이블
  const label = (() => {
    const { period, hour12, minute } = parse(value);
    return `${period === "AM" ? "오전" : "오후"} ${hour12}:${String(minute).padStart(2, "0")}`;
  })();

  return (
    <>
      {/* 시간 표시 버튼 */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "border border-input rounded-xl px-3.5 py-3 w-full bg-background text-[13px] text-left",
          "focus:outline-none focus:ring-1 focus:ring-ring active:opacity-70 transition-opacity",
          className
        )}
      >
        {label}
      </button>

      {/* 바텀 시트 오버레이 */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-end">
          {/* 배경 딤 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* 피커 패널 */}
          <div
            className="relative w-full rounded-t-2xl bg-background shadow-2xl animate-in slide-in-from-bottom duration-250"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-muted-foreground/25" />
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[13.5px] text-muted-foreground active:opacity-60"
              >
                취소
              </button>
              <span className="text-[14px] font-semibold">시간 선택</span>
              <button
                type="button"
                onClick={handleConfirm}
                className="text-[13.5px] font-semibold text-primary active:opacity-60"
              >
                확인
              </button>
            </div>

            {/* AM/PM 토글 */}
            <div className="px-5 pb-4">
              <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-muted/40">
                {(["AM", "PM"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelPeriod(p)}
                    className={cn(
                      "py-3 rounded-xl text-[15px] font-semibold transition-all duration-200",
                      selPeriod === p
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground/60 hover:text-muted-foreground"
                    )}
                  >
                    {p === "AM" ? "오전" : "오후"}
                  </button>
                ))}
              </div>
            </div>

            {/* 드럼 피커 */}
            <div className="flex items-center gap-1 px-4 pb-5">
              <DrumPicker
                items={HOURS}
                selected={selHour}
                onSelect={setSelHour}
              />
              <div className="flex flex-col gap-4 pb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
              </div>
              <DrumPicker
                items={MINUTES}
                selected={selMin}
                onSelect={setSelMin}
                fmt={(v) => String(v).padStart(2, "0")}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
