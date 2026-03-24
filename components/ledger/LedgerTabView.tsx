"use client";

// 가계부 탭 뷰 ("일일" 목록 / "달력" 전환) + 공유 월 상태 관리
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DailyView } from "./DailyView";
import { CalendarView } from "./CalendarView";
import { SearchView } from "./SearchView";
import { ChevronLeft, ChevronRight, ChevronDown, Search } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, parse, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import { getLedgerMonthData } from "@/lib/actions/transactions";
import type { Transaction, Category, Asset, RecurringTransaction } from "@/lib/mock/types";
import { useSwipeMonth } from "@/hooks/useSwipeMonth";

// localStorage 캐시 키
const LS_KEY = "ledger_cache_v1";

type CacheEntry = {
  transactions: Transaction[];
  categories: Category[];
  assets: Asset[];
  recurring: RecurringTransaction[];
};

// localStorage에서 특정 월 캐시 읽기
function readLocalCache(key: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as Record<string, CacheEntry>;
    return store[key] ?? null;
  } catch {
    return null;
  }
}

// localStorage에 특정 월 캐시 저장 (최근 3개월만 유지)
function writeLocalCache(key: string, data: CacheEntry): void {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const store = raw ? (JSON.parse(raw) as Record<string, CacheEntry>) : {};
    store[key] = data;
    // 최근 3개 키만 유지 (오래된 항목 제거)
    const keys = Object.keys(store).sort().reverse();
    if (keys.length > 3) keys.slice(3).forEach((k) => delete store[k]);
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch {
    // localStorage 사용 불가 환경 무시
  }
}

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

interface LedgerTabViewProps {
  // 서버 컴포넌트에서 SSR 시점에 미리 fetch한 현재 달 데이터 (선택적)
  initialData?: CacheEntry;
  // SSR 데이터에 해당하는 달 키 (예: "2026-03")
  initialMonthKey?: string;
}

export function LedgerTabView({ initialData, initialMonthKey }: LedgerTabViewProps = {}) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("list");
  const [currentMonth, setCurrentMonthState] = useState<Date>(() =>
    parseMonthParam(searchParams.get("month"))
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => currentMonth.getFullYear());

  // 마운트 후 사용자가 직접 월을 변경한 경우에만 URL 업데이트 (초기 마운트 스킵)
  const isMountedRef = useRef(false);

  const setCurrentMonth = useCallback((updater: Date | ((prev: Date) => Date)) => {
    setCurrentMonthState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  }, []);

  // 사용자가 월을 변경했을 때만 URL 업데이트 (Next.js RSC fetch 방지)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    const param = format(currentMonth, "yyyy-MM");
    window.history.replaceState(null, "", `?month=${param}`);
  }, [currentMonth]);

  // 검색 모드
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // SearchView 안에서 시트(수정 화면)가 열려있는지 추적 (뒤로가기 처리용)
  const isSearchSheetOpenRef = useRef(false);

  // 공유 데이터 상태 (DailyView, CalendarView에 props로 전달)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([]);
  // SSR initialData 또는 localStorage 캐시가 있으면 즉시 표시 (로딩 스피너 없음)
  const [isLoading, setIsLoading] = useState(true);

  // 인메모리 캐시 (같은 달로 돌아올 때 재사용)
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  // 현재 로딩 중인 키 추적 (중복 호출 방지)
  const fetchingKeyRef = useRef<string | null>(null);
  // 초기 데이터가 이미 표시 중인지 추적 (로딩 스피너 생략 판단용)
  const hasInitialDataRef = useRef(false);

  // 초기 마운트 시 SSR 데이터 또는 localStorage 캐시로 즉시 표시
  useEffect(() => {
    const key = format(currentMonth, "yyyy-MM");

    // 1순위: 서버에서 넘겨준 SSR 초기 데이터
    if (initialData && initialMonthKey === key) {
      cacheRef.current.set(key, initialData);
      setTransactions(initialData.transactions);
      setCategories(initialData.categories);
      setAssets(initialData.assets);
      setRecurringItems(initialData.recurring);
      setIsLoading(false);
      hasInitialDataRef.current = true;
      // SSR 데이터도 localStorage에 저장 (PWA 다음 재시작 시 즉시 표시)
      writeLocalCache(key, initialData);
      return;
    }

    // 2순위: localStorage 캐시 (PWA 재시작 시 즉시 표시)
    const lsCache = readLocalCache(key);
    if (lsCache) {
      cacheRef.current.set(key, lsCache);
      setTransactions(lsCache.transactions);
      setCategories(lsCache.categories);
      setAssets(lsCache.assets);
      setRecurringItems(lsCache.recurring);
      setIsLoading(false);
      hasInitialDataRef.current = true;
      // 캐시로 즉시 표시 후 백그라운드에서 최신 데이터 fetch (stale-while-revalidate)
      // loadData useEffect에서 캐시를 인메모리에서 찾아 리턴하지 않도록
      // 인메모리 캐시에서는 제거하여 fresh fetch 유도
      cacheRef.current.delete(key);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 1회만 실행

  const loadData = useCallback(async (invalidateCache = false) => {
    const key = format(currentMonth, "yyyy-MM");
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    // 같은 달을 이미 로딩 중이면 스킵 (React StrictMode 중복 방지)
    if (fetchingKeyRef.current === key && !invalidateCache) return;
    fetchingKeyRef.current = key;

    if (invalidateCache) {
      cacheRef.current.delete(key);
    } else {
      // 인메모리 캐시 히트 (SSR 데이터 또는 이전 fetch 결과)
      const cached = cacheRef.current.get(key);
      if (cached) {
        setTransactions(cached.transactions);
        setCategories(cached.categories);
        setAssets(cached.assets);
        setRecurringItems(cached.recurring);
        setIsLoading(false);
        fetchingKeyRef.current = null;
        return;
      }
    }

    // 캐시 미스 또는 강제 갱신: 로딩 표시 후 fetch
    // 초기 데이터(SSR/localStorage)가 이미 화면에 표시 중이면 로딩 스피너 생략
    if (!hasInitialDataRef.current) setIsLoading(true);

    try {
      const data = await getLedgerMonthData(year, month);
      cacheRef.current.set(key, data);
      // localStorage에 저장 (PWA 다음 재시작 시 즉시 표시)
      writeLocalCache(key, data);
      setTransactions(data.transactions);
      setCategories(data.categories);
      setAssets(data.assets);
      setRecurringItems(data.recurring);
    } finally {
      setIsLoading(false);
      hasInitialDataRef.current = false;
      fetchingKeyRef.current = null;
    }
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
          categories={categories}
          assets={assets}
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
