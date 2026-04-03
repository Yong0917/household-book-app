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
  setMonth,
  setYear,
  getYear,
  getMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "day" | "month" | "year";

interface DatePickerProps {
  value: string; // "yyyy-MM-dd"
  onChange: (value: string) => void;
  className?: string;
}

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

// 연도 페이지 시작 연도 (12개씩)
function yearPageStart(year: number) {
  return Math.floor(year / 12) * 12;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const parseDate = (val: string): Date => {
    try {
      return parse(val, "yyyy-MM-dd", new Date());
    } catch {
      return new Date();
    }
  };

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("day");
  const [viewMonth, setViewMonth] = useState<Date>(() => parseDate(value));
  // year 뷰에서 현재 보이는 페이지의 시작 연도
  const [yearStart, setYearStart] = useState<number>(() => yearPageStart(getYear(parseDate(value))));

  const selected = parseDate(value);

  const handleOpen = () => {
    const d = parseDate(value);
    setViewMonth(d);
    setYearStart(yearPageStart(getYear(d)));
    setView("day");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleToday = () => {
    const today = new Date();
    onChange(format(today, "yyyy-MM-dd"));
    setViewMonth(today);
    setOpen(false);
  };

  // day 뷰: 날짜 선택
  const handleSelectDay = useCallback(
    (day: Date) => {
      onChange(format(day, "yyyy-MM-dd"));
      setOpen(false);
    },
    [onChange]
  );

  // month 뷰: 월 선택 → day 뷰
  const handleSelectMonth = (monthIdx: number) => {
    setViewMonth((m) => setMonth(m, monthIdx));
    setView("day");
  };

  // year 뷰: 연도 선택 → month 뷰
  const handleSelectYear = (year: number) => {
    setViewMonth((m) => setYear(m, year));
    setView("month");
  };

  // 캘린더 그리드
  const calDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 }),
  });

  const curYear = getYear(viewMonth);
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i);

  // 버튼 표시 레이블
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
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

          {/* 캘린더 패널 */}
          <div
            className="relative w-full rounded-t-2xl bg-background shadow-2xl animate-in slide-in-from-bottom duration-250"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-muted-foreground/25" />
            </div>

            {/* 공통 헤더 (취소 / 제목 / 오늘) */}
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <button
                type="button"
                onClick={handleClose}
                className="text-[13.5px] text-muted-foreground active:opacity-60"
              >
                취소
              </button>
              <span />
              <button
                type="button"
                onClick={handleToday}
                className="text-[13.5px] font-semibold text-primary active:opacity-60"
              >
                오늘
              </button>
            </div>

            {/* ── DAY 뷰 ── */}
            {view === "day" && (
              <>
                {/* 월 네비게이션 */}
                <div className="flex items-center justify-between px-4 pb-3">
                  <button
                    type="button"
                    onClick={() => setViewMonth((m) => subMonths(m, 1))}
                    className="p-2 rounded-lg active:opacity-60 transition-opacity"
                  >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                  </button>

                  {/* 탭하면 month 뷰로 전환 */}
                  <button
                    type="button"
                    onClick={() => setView("month")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg active:bg-muted/50 transition-colors"
                  >
                    <span className="text-[15px] font-semibold">
                      {format(viewMonth, "yyyy년 M월")}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMonth((m) => addMonths(m, 1))}
                    className="p-2 rounded-lg active:opacity-60 transition-opacity"
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
                        onClick={() => handleSelectDay(day)}
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
              </>
            )}

            {/* ── MONTH 뷰 ── */}
            {view === "month" && (
              <>
                {/* 연도 네비게이션 */}
                <div className="flex items-center justify-between px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => setViewMonth((m) => setYear(m, curYear - 1))}
                    className="p-2 rounded-lg active:opacity-60 transition-opacity"
                  >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                  </button>

                  {/* 탭하면 year 뷰로 전환 */}
                  <button
                    type="button"
                    onClick={() => {
                      setYearStart(yearPageStart(curYear));
                      setView("year");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg active:bg-muted/50 transition-colors"
                  >
                    <span className="text-[15px] font-semibold">{curYear}년</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMonth((m) => setYear(m, curYear + 1))}
                    className="p-2 rounded-lg active:opacity-60 transition-opacity"
                  >
                    <ChevronRight className="h-4 w-4 text-foreground" />
                  </button>
                </div>

                {/* 월 그리드 (4×3) */}
                <div className="grid grid-cols-4 gap-2 px-4 pb-6">
                  {MONTHS.map((name, idx) => {
                    const isCurrentSelected =
                      isSameMonth(selected, viewMonth) &&
                      curYear === getYear(selected) &&
                      idx === getMonth(selected);
                    const isCurMonth =
                      curYear === getYear(new Date()) && idx === getMonth(new Date());

                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleSelectMonth(idx)}
                        className={cn(
                          "py-3 rounded-xl text-[13.5px] font-medium transition-all active:scale-95",
                          isCurrentSelected
                            ? "bg-primary text-primary-foreground font-bold"
                            : isCurMonth
                            ? "border border-primary/50 text-foreground font-semibold"
                            : "text-foreground hover:bg-muted/50"
                        )}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── YEAR 뷰 ── */}
            {view === "year" && (
              <>
                {/* 연도 페이지 네비게이션 */}
                <div className="flex items-center justify-between px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => setYearStart((y) => y - 12)}
                    className="p-2 rounded-lg active:opacity-60 transition-opacity"
                  >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                  </button>
                  <span className="text-[15px] font-semibold text-muted-foreground">
                    {yearStart} – {yearStart + 11}
                  </span>
                  <button
                    type="button"
                    onClick={() => setYearStart((y) => y + 12)}
                    className="p-2 rounded-lg active:opacity-60 transition-opacity"
                  >
                    <ChevronRight className="h-4 w-4 text-foreground" />
                  </button>
                </div>

                {/* 연도 그리드 (4×3) */}
                <div className="grid grid-cols-4 gap-2 px-4 pb-6">
                  {years.map((year) => {
                    const isSelectedYear = year === getYear(selected);
                    const isThisYear = year === getYear(new Date());

                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleSelectYear(year)}
                        className={cn(
                          "py-3 rounded-xl text-[13.5px] font-medium transition-all active:scale-95",
                          isSelectedYear
                            ? "bg-primary text-primary-foreground font-bold"
                            : isThisYear
                            ? "border border-primary/50 text-foreground font-semibold"
                            : "text-foreground hover:bg-muted/50"
                        )}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
