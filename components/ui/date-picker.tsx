"use client";

import { useState, useCallback } from "react";
import {
  format,
  parse,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string; // "yyyy-MM-dd"
  onChange: (value: string) => void;
  className?: string;
}

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const parseDate = (val: string): Date => {
    try {
      return parse(val, "yyyy-MM-dd", new Date());
    } catch {
      return new Date();
    }
  };

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => parseDate(value));
  const selected = parseDate(value);

  const handleOpen = () => {
    setViewMonth(parseDate(value));
    setOpen(true);
  };

  const handleSelect = useCallback(
    (day: Date) => {
      onChange(format(day, "yyyy-MM-dd"));
      setOpen(false);
    },
    [onChange]
  );

  const handleToday = () => {
    const today = new Date();
    onChange(format(today, "yyyy-MM-dd"));
    setViewMonth(today);
    setOpen(false);
  };

  // 캘린더 그리드 생성 (6주 고정)
  const calDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 }),
  });

  // 표시 레이블
  const label = format(selected, "M월 d일 (EEE)", { locale: ko });

  return (
    <>
      {/* 날짜 표시 버튼 */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex items-center gap-2 border border-input rounded-xl px-3.5 py-3 w-full bg-background text-[13px] text-left",
          "focus:outline-none focus:ring-1 focus:ring-ring active:opacity-70 transition-opacity",
          className
        )}
      >
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
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

          {/* 캘린더 패널 */}
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
              <span className="text-[14px] font-semibold">날짜 선택</span>
              <button
                type="button"
                onClick={handleToday}
                className="text-[13.5px] font-semibold text-primary active:opacity-60"
              >
                오늘
              </button>
            </div>

            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between px-4 pb-3">
              <button
                type="button"
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
                className="p-2 rounded-lg hover:bg-muted/50 active:opacity-60 transition-opacity"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <span className="text-[15px] font-semibold">
                {format(viewMonth, "yyyy년 M월")}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="p-2 rounded-lg hover:bg-muted/50 active:opacity-60 transition-opacity"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 px-3 pb-1">
              {DOW.map((d, i) => (
                <div
                  key={d}
                  className={cn(
                    "text-center text-[11px] font-semibold py-1",
                    i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-muted-foreground"
                  )}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 px-3 pb-5">
              {calDays.map((day) => {
                const isSelected = isSameDay(day, selected);
                const isCurrentMonth = isSameMonth(day, viewMonth);
                const isTodayDay = isToday(day);
                const dow = day.getDay();

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleSelect(day)}
                    className={cn(
                      "flex items-center justify-center rounded-full mx-auto aspect-square w-9 text-[13px] transition-all active:scale-95",
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold"
                        : isTodayDay
                        ? "border border-primary/50 font-semibold text-foreground"
                        : isCurrentMonth
                        ? dow === 0
                          ? "text-red-400"
                          : dow === 6
                          ? "text-blue-400"
                          : "text-foreground"
                        : "text-muted-foreground/30"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
