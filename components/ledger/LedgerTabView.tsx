"use client";

// 가계부 탭 뷰 ("일일" 목록 / "달력" 전환) + 공유 월 상태 관리
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DailyView } from "./DailyView";
import { CalendarView } from "./CalendarView";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { ko } from "date-fns/locale";

type Tab = "list" | "calendar";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export function LedgerTabView() {
  const [tab, setTab] = useState<Tab>("list");
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());

  const openPicker = () => {
    setPickerYear(currentMonth.getFullYear());
    setIsPickerOpen(true);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(pickerYear, monthIndex, 1));
    setIsPickerOpen(false);
  };

  return (
    <div className="flex flex-col">
      {/* 월 네비게이션 헤더 (sticky top-0) */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/60">
        <div className="flex items-center justify-center gap-0.5 px-4 h-12">
          {/* 이전 달 버튼 */}
          <button
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* 월 텍스트 버튼 - 클릭 시 월 선택 팝업 */}
          <button
            onClick={openPicker}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <span className="text-[15px] font-semibold tracking-tight">
              {format(currentMonth, "yyyy년 M월", { locale: ko })}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {/* 다음 달 버튼 */}
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 탭 바 (sticky top-12, 월 헤더 아래) */}
      <div className="flex h-11 border-b border-border/60 sticky top-12 z-20 bg-background/95 backdrop-blur-sm">
        <button
          onClick={() => setTab("list")}
          className={cn(
            "flex-1 text-[13px] font-medium transition-colors relative",
            tab === "list" ? "text-primary" : "text-muted-foreground/60"
          )}
        >
          일일
          {tab === "list" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setTab("calendar")}
          className={cn(
            "flex-1 text-[13px] font-medium transition-colors relative",
            tab === "calendar" ? "text-primary" : "text-muted-foreground/60"
          )}
        >
          달력
          {tab === "calendar" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {tab === "list"
        ? <DailyView currentMonth={currentMonth} />
        : <CalendarView currentMonth={currentMonth} />
      }

      {/* 월 선택 팝업 */}
      {isPickerOpen && (
        <>
          {/* 배경 오버레이 (클릭 시 닫기) */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsPickerOpen(false)}
          />
          {/* 팝업 카드 - 가로 중앙 정렬 */}
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-40 bg-background border border-border/60 rounded-2xl shadow-xl shadow-foreground/8 p-5 w-[21rem]">
            {/* 연도 선택 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setPickerYear((y) => y - 1)}
                className="p-2 rounded-full hover:bg-muted/80 transition-colors"
                aria-label="이전 연도"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[15px] font-semibold tracking-tight">{pickerYear}년</span>
              <button
                onClick={() => setPickerYear((y) => y + 1)}
                className="p-2 rounded-full hover:bg-muted/80 transition-colors"
                aria-label="다음 연도"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 월 그리드 (3×4) */}
            <div className="grid grid-cols-3 gap-2">
              {MONTH_LABELS.map((label, idx) => {
                const isSelected =
                  pickerYear === currentMonth.getFullYear() &&
                  idx === currentMonth.getMonth();
                return (
                  <button
                    key={idx}
                    onClick={() => handleMonthSelect(idx)}
                    className={cn(
                      "py-4 rounded-xl text-[13px] font-medium transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/80 text-foreground active:scale-[0.97]"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
