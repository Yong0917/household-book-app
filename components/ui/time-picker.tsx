"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Clock } from "lucide-react";
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

const HOURS = Array.from({ length: 24 }, (_, i) => i);   // 0~23
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0~59

function parse(val: string) {
  const [h, m] = val.split(":").map(Number);
  return {
    hour: isNaN(h) ? 0 : h,
    minute: isNaN(m) ? 0 : m,
  };
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const { hour, minute } = parse(value);

  const [open, setOpen] = useState(false);
  const [selHour, setSelHour] = useState(hour);
  const [selMin, setSelMin] = useState(minute);

  const handleOpen = () => {
    const p = parse(value);
    setSelHour(p.hour);
    setSelMin(p.minute);
    setOpen(true);
  };

  const handleConfirm = () => {
    const hh = String(selHour).padStart(2, "0");
    const mm = String(selMin).padStart(2, "0");
    onChange(`${hh}:${mm}`);
    setOpen(false);
  };

  // 표시: 오전/오후 형식
  const label = (() => {
    const { hour, minute } = parse(value);
    const period = hour >= 12 ? "오후" : "오전";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${period} ${h12}:${String(minute).padStart(2, "0")}`;
  })();

  return (
    <>
      {/* 시간 표시 버튼 */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex items-center gap-2 border border-input rounded-xl px-3.5 py-3 w-full bg-background text-[13px] text-left",
          "focus:outline-none focus:ring-1 focus:ring-ring active:opacity-70 transition-opacity",
          className
        )}
      >
        <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <span>{label}</span>
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

            {/* 드럼 피커 */}
            <div className="flex items-center gap-1 px-4 pb-5">
              <DrumPicker
                items={HOURS}
                selected={selHour}
                onSelect={setSelHour}
                fmt={(v) => String(v).padStart(2, "0")}
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
