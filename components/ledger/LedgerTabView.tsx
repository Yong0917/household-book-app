"use client";

// 가계부 탭 뷰 ("일일" 목록 / "달력" 전환) + 공유 월 상태 관리
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DailyView } from "./DailyView";
import { CalendarView } from "./CalendarView";
import { SearchView } from "./SearchView";
import { ChevronLeft, ChevronRight, ChevronDown, Search } from "lucide-react";
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

  // 검색 모드
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openPicker = () => {
    setPickerYear(currentMonth.getFullYear());
    setIsPickerOpen(true);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(pickerYear, monthIndex, 1));
    setIsPickerOpen(false);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    history.pushState({ searchView: true }, "");
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    // popstate 리스너가 있으면 history.back()이 리스너를 트리거하므로 직접 back만 호출
    if (history.state?.searchView) {
      history.back();
    }
  };

  // 뒤로가기 버튼으로 검색 닫기
  useEffect(() => {
    if (!isSearchOpen) return;
    const handlePopState = () => {
      setIsSearchOpen(false);
    };
    window.addEventListener("popstate", handlePopState, { once: true });
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isSearchOpen]);

  return (
    <div className="flex flex-col">
      {/* 헤더: 월 네비게이션(좌) + 검색·필터 버튼(우) */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/60">
        <div className="flex items-center justify-between px-2 h-12">
          {/* 월 네비게이션 (왼쪽 정렬) */}
          <div className="flex items-center gap-0.5">
            {/* 이전 달 */}
            <button
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
              className="p-2 rounded-full hover:bg-muted/80 transition-colors"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* 월 텍스트 - 클릭 시 월 선택 팝업 */}
            <button
              onClick={openPicker}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted/80 transition-colors"
            >
              <span className="text-[15px] font-semibold tracking-tight">
                {format(currentMonth, "yyyy년 M월", { locale: ko })}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {/* 다음 달 */}
            <button
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
              className="p-2 rounded-full hover:bg-muted/80 transition-colors"
              aria-label="다음 달"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* 검색 버튼 (오른쪽) */}
          <button
            onClick={openSearch}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
            aria-label="검색"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* 탭 바 (sticky, 헤더 아래) */}
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

      {/* 검색 뷰 오버레이 */}
      {isSearchOpen && (
        <SearchView onBack={closeSearch} />
      )}

      {/* 월 선택 팝업 */}
      {isPickerOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsPickerOpen(false)}
          />
          {/* 팝업 카드 */}
          <div className="fixed top-12 left-4 z-40 bg-background border border-border/60 rounded-2xl shadow-xl shadow-foreground/8 p-5 w-[21rem]">
            {/* 연도 선택 */}
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
