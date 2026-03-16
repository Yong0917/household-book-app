"use client";

// 가계부 탭 뷰 ("일일" 목록 / "달력" 전환) + 공유 월 상태 관리
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DailyView } from "./DailyView";
import { CalendarView } from "./CalendarView";
import { SearchView } from "./SearchView";
import { ChevronLeft, ChevronRight, ChevronDown, Search } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, parse, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import { getTransactionsByMonth } from "@/lib/actions/transactions";
import { getCategories } from "@/lib/actions/categories";
import { getAssets } from "@/lib/actions/assets";
import { getUnprocessedRecurring } from "@/lib/actions/recurring";
import type { Transaction, Category, Asset, RecurringTransaction } from "@/lib/mock/types";
import { useSwipeMonth } from "@/hooks/useSwipeMonth";

type Tab = "list" | "calendar";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

function parseMonthParam(param: string | null): Date {
  if (!param) return startOfMonth(new Date());
  const parsed = parse(param, "yyyy-MM", new Date());
  return isValid(parsed) ? startOfMonth(parsed) : startOfMonth(new Date());
}

export function LedgerTabView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("list");
  const [currentMonth, setCurrentMonthState] = useState<Date>(() =>
    parseMonthParam(searchParams.get("month"))
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => currentMonth.getFullYear());

  const setCurrentMonth = useCallback((updater: Date | ((prev: Date) => Date)) => {
    setCurrentMonthState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  // currentMonth 변경 시 URL 업데이트
  useEffect(() => {
    const param = format(currentMonth, "yyyy-MM");
    router.replace(`?month=${param}`, { scroll: false });
  }, [currentMonth, router]);

  // 검색 모드
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // SearchView 안에서 시트(수정 화면)가 열려있는지 추적 (뒤로가기 처리용)
  const isSearchSheetOpenRef = useRef(false);

  // 공유 데이터 상태 (DailyView, CalendarView에 props로 전달)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 월별 트랜잭션 캐시 (같은 달로 돌아올 때 재사용)
  const txCacheRef = useRef<Map<string, Transaction[]>>(new Map());
  // categories/assets는 한 번만 로드
  const staticLoadedRef = useRef(false);

  const loadData = useCallback(async (invalidateCache = false) => {
    const key = format(currentMonth, "yyyy-MM");

    if (invalidateCache) {
      txCacheRef.current.delete(key);
    }

    const cached = txCacheRef.current.get(key);
    const hasStatic = staticLoadedRef.current;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    setIsLoading(true);

    // 트랜잭션 캐시 히트 + 정적 데이터 이미 로드됨 → 고정비만 재조회
    if (cached && hasStatic) {
      const recurring = await getUnprocessedRecurring(year, month);
      setTransactions(cached);
      setRecurringItems(recurring);
      setIsLoading(false);
      return;
    }

    if (cached) {
      // 트랜잭션은 캐시, 정적 데이터만 로드
      const [cats, assts, recurring] = await Promise.all([
        getCategories(),
        getAssets(),
        getUnprocessedRecurring(year, month),
      ]);
      setCategories(cats);
      setAssets(assts);
      setRecurringItems(recurring);
      setTransactions(cached);
      staticLoadedRef.current = true;
    } else if (hasStatic) {
      // 정적 데이터는 캐시, 트랜잭션 + 고정비만 로드
      const [txs, recurring] = await Promise.all([
        getTransactionsByMonth(year, month),
        getUnprocessedRecurring(year, month),
      ]);
      txCacheRef.current.set(key, txs);
      setTransactions(txs);
      setRecurringItems(recurring);
    } else {
      // 모두 로드
      const [txs, cats, assts, recurring] = await Promise.all([
        getTransactionsByMonth(year, month),
        getCategories(),
        getAssets(),
        getUnprocessedRecurring(year, month),
      ]);
      txCacheRef.current.set(key, txs);
      setTransactions(txs);
      setCategories(cats);
      setAssets(assts);
      setRecurringItems(recurring);
      staticLoadedRef.current = true;
    }

    setIsLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 거래 추가/수정/삭제 후 현재 월 캐시 무효화 후 재로드
  const handleSuccess = useCallback(() => {
    loadData(true);
  }, [loadData]);

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

  const { onTouchStart, onTouchEnd } = useSwipeMonth(
    setCurrentMonth,
    !isPickerOpen && !isSearchOpen
  );

  // 뒤로가기 버튼으로 검색 닫기
  // 시트가 열려있는 동안은 SearchView의 popstate 핸들러가 처리하므로 여기서는 무시
  useEffect(() => {
    if (!isSearchOpen) return;
    const handlePopState = () => {
      if (isSearchSheetOpenRef.current) return;
      setIsSearchOpen(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isSearchOpen]);

  return (
    <div className="flex flex-col min-h-[calc(100dvh-4rem)]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* 헤더: 월 네비게이션(좌) + 검색 버튼(우) */}
      <div className="sticky top-0 z-20 bg-background/97 backdrop-blur-xl border-b border-border/40">
        <div className="flex items-center justify-between px-2 h-13">
          {/* 월 네비게이션 */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
              className="p-2 rounded-full hover:bg-muted/60 active:bg-muted transition-colors"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-[15px] w-[15px] text-foreground/70" />
            </button>

            <button
              onClick={openPicker}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
            >
              <span className="text-[15.5px] font-bold tracking-tight">
                {format(currentMonth, "yyyy년 M월", { locale: ko })}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
            </button>

            <button
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
              className="p-2 rounded-full hover:bg-muted/60 active:bg-muted transition-colors"
              aria-label="다음 달"
            >
              <ChevronRight className="h-[15px] w-[15px] text-foreground/70" />
            </button>
          </div>

          {/* 검색 버튼 */}
          <button
            onClick={openSearch}
            className="p-2 rounded-full hover:bg-muted/60 active:bg-muted transition-colors mr-1"
            aria-label="검색"
          >
            <Search className="h-[17px] w-[17px] text-foreground/65" />
          </button>
        </div>
      </div>

      {/* 탭 바 */}
      <div className="flex h-10 border-b border-border/40 sticky top-13 z-20 bg-background/97 backdrop-blur-xl">
        <button
          onClick={() => setTab("list")}
          className={cn(
            "flex-1 text-[12.5px] font-semibold transition-all relative tracking-tight",
            tab === "list" ? "text-primary" : "text-muted-foreground/40"
          )}
        >
          일일
          {tab === "list" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setTab("calendar")}
          className={cn(
            "flex-1 text-[12.5px] font-semibold transition-all relative tracking-tight",
            tab === "calendar" ? "text-primary" : "text-muted-foreground/40"
          )}
        >
          달력
          {tab === "calendar" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {tab === "list"
        ? <DailyView
            currentMonth={currentMonth}
            transactions={transactions}
            categories={categories}
            assets={assets}
            isLoading={isLoading}
            onSuccess={handleSuccess}
            recurringItems={recurringItems}
          />
        : <CalendarView
            currentMonth={currentMonth}
            transactions={transactions}
            categories={categories}
            assets={assets}
            isLoading={isLoading}
            onSuccess={handleSuccess}
          />
      }

      {/* 검색 뷰 오버레이 */}
      {isSearchOpen && (
        <SearchView
          onBack={closeSearch}
          onSheetOpenChange={(open) => { isSearchSheetOpenRef.current = open; }}
        />
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
