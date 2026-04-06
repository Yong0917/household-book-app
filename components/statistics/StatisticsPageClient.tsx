"use client";

// 통계 페이지 클라이언트 - 수입/지출 탭 통합 (기본: 지출)
import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, isSameMonth, parseISO, parse, isValid } from "date-fns";
import { useSwipeMonth } from "@/hooks/useSwipeMonth";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DonutChart } from "@/components/statistics/DonutChart";
import dynamic from "next/dynamic";
const CategoryDetailSheet = dynamic(
  () => import("@/components/statistics/CategoryDetailSheet").then((m) => ({ default: m.CategoryDetailSheet })),
  { ssr: false }
);
const MonthlyTrendChart = dynamic(
  () => import("@/components/statistics/MonthlyTrendChart").then((m) => ({ default: m.MonthlyTrendChart })),
  { ssr: false }
);
import { getStatisticsPageData } from "@/lib/actions/transactions";
import { getGuestStatisticsData } from "@/lib/mock/guestData";
import { useGuestMode } from "@/lib/context/GuestModeContext";
import type { Transaction, Category, TransactionType } from "@/lib/mock/types";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

// localStorage 캐시 키
const LS_KEY = "stats_cache_v1";

type StatsCacheEntry = {
  transactions: Transaction[];
  categories: Category[];
  trend: { year: number; month: number; label: string; income: number; expense: number }[];
};

function readLocalCache(key: string): StatsCacheEntry | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as Record<string, StatsCacheEntry>;
    return store[key] ?? null;
  } catch {
    return null;
  }
}

function writeLocalCache(key: string, data: StatsCacheEntry): void {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const store = raw ? (JSON.parse(raw) as Record<string, StatsCacheEntry>) : {};
    store[key] = data;
    // 최근 6개 키만 유지 (달 × trendCount 조합)
    const keys = Object.keys(store).sort().reverse();
    if (keys.length > 6) keys.slice(6).forEach((k) => delete store[k]);
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch {
    // localStorage 사용 불가 환경 무시
  }
}

interface StatisticsPageClientProps {
  initialData?: StatsCacheEntry;
  initialMonthKey?: string;
}

function parseMonthParam(param: string | null): Date {
  if (!param) return startOfMonth(new Date());
  const parsed = parse(param, "yyyy-MM", new Date());
  return isValid(parsed) ? startOfMonth(parsed) : startOfMonth(new Date());
}

export function StatisticsPageClient({ initialData, initialMonthKey }: StatisticsPageClientProps = {}) {
  return (
    <Suspense fallback={null}>
      <StatisticsContent initialData={initialData} initialMonthKey={initialMonthKey} />
    </Suspense>
  );
}

function StatisticsContent({ initialData, initialMonthKey }: StatisticsPageClientProps) {
  const { isGuest } = useGuestMode();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [currentMonth, setCurrentMonthState] = useState<Date>(() =>
    parseMonthParam(searchParams.get("month"))
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => currentMonth.getFullYear());
  const [trendCount, setTrendCount] = useState(6);

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

  // 카테고리 상세 드로어
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCategoryId, setDetailCategoryId] = useState<string | null>(null);

  // 3개 상태를 하나로 통합 → React 18에서도 명시적 단일 리렌더 보장
  const [statsData, setStatsData] = useState<StatsCacheEntry>({
    transactions: [],
    categories: [],
    trend: [],
  });
  const [trendLoading, setTrendLoading] = useState(true);
  const { transactions, categories, trendData } = {
    transactions: statsData.transactions,
    categories: statsData.categories,
    trendData: statsData.trend,
  };

  // 인메모리 캐시 (같은 달/기간으로 돌아올 때 재사용)
  const cacheRef = useRef<Map<string, StatsCacheEntry>>(new Map());
  // 현재 로딩 중인 키 추적 (중복 호출 방지)
  const fetchingKeyRef = useRef<string | null>(null);
  // SSR/localStorage 캐시 데이터가 화면에 표시 중인지 (로딩 스피너 생략 판단용)
  const hasInitialDataRef = useRef(false);

  // 마운트 시 SSR 데이터 또는 localStorage 캐시로 즉시 표시
  useEffect(() => {
    const key = `${format(currentMonth, "yyyy-MM")}-6`;

    // 게스트 모드: 샘플 데이터 즉시 표시
    if (isGuest) {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const data = getGuestStatisticsData(year, month, 6);
      setStatsData(data);
      setTrendLoading(false);
      hasInitialDataRef.current = true;
      return;
    }

    // 1순위: 서버에서 넘겨준 SSR 초기 데이터
    if (initialData && initialMonthKey && `${initialMonthKey}-6` === key) {
      cacheRef.current.set(key, initialData);
      setStatsData(initialData);
      setTrendLoading(false);
      hasInitialDataRef.current = true;
      writeLocalCache(key, initialData);
      return;
    }

    // 2순위: localStorage 캐시 (앱 재시작 시 즉시 표시)
    const lsCache = readLocalCache(key);
    if (lsCache) {
      setStatsData(lsCache);
      setTrendLoading(false);
      hasInitialDataRef.current = true;
      // 인메모리 캐시에는 넣지 않음 → 이후 useEffect에서 fresh fetch 유도
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 1회만 실행

  // 달 또는 추이 기간 변경 시 데이터 단일 조회
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const key = `${format(currentMonth, "yyyy-MM")}-${trendCount}`;

    if (fetchingKeyRef.current === key) return;
    fetchingKeyRef.current = key;

    // 인메모리 캐시 히트
    const cached = cacheRef.current.get(key);
    if (cached) {
      setStatsData(cached);
      setTrendLoading(false);
      fetchingKeyRef.current = null;
      return;
    }

    // 게스트 모드: 샘플 데이터
    if (isGuest) {
      const data = getGuestStatisticsData(year, month, trendCount);
      setStatsData(data);
      setTrendLoading(false);
      fetchingKeyRef.current = null;
      return;
    }

    // 캐시 미스: SSR/localStorage 데이터가 이미 표시 중이면 스피너 생략
    if (!hasInitialDataRef.current) setTrendLoading(true);

    getStatisticsPageData(year, month, trendCount).then((data) => {
      cacheRef.current.set(key, data);
      writeLocalCache(key, data);
      setStatsData(data);
      setTrendLoading(false);
      hasInitialDataRef.current = false;
      fetchingKeyRef.current = null;
    });
  }, [currentMonth, trendCount, isGuest]);

  const { onTouchStart, onTouchEnd } = useSwipeMonth(setCurrentMonth, !isPickerOpen);

  const openPicker = () => {
    setPickerYear(currentMonth.getFullYear());
    setIsPickerOpen(true);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(pickerYear, monthIndex, 1));
    setIsPickerOpen(false);
  };

  // 탭·달·데이터가 바뀔 때만 재계산 (렌더마다 재연산 방지)
  const { chartData, total } = useMemo(() => {
    const filtered = transactions.filter(
      (t) => t.type === activeTab && isSameMonth(parseISO(t.transactionAt), currentMonth)
    );

    const categoryLookup = new Map(categories.map((c) => [c.id, c]));

    const categoryAmountMap = new Map<string, number>();
    filtered.forEach((t) => {
      categoryAmountMap.set(t.categoryId, (categoryAmountMap.get(t.categoryId) ?? 0) + t.amount);
    });

    const chartData = Array.from(categoryAmountMap.entries())
      .map(([catId, value]) => {
        const cat = categoryLookup.get(catId);
        return { id: catId, name: cat?.name ?? "기타", value, color: cat?.color ?? "#6b7280" };
      })
      .sort((a, b) => b.value - a.value);

    const total = chartData.reduce((sum, d) => sum + d.value, 0);
    return { chartData, total };
  }, [transactions, categories, activeTab, currentMonth]);

  const isExpense = activeTab === "expense";

  return (
    <div className="min-h-[calc(100dvh-4rem)]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* 월 이동 헤더 */}
      <header
        className="sticky top-0 bg-background/96 backdrop-blur-md border-b border-border/50 z-10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-center gap-0.5 px-4 h-13">
          <button
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            className="p-2 rounded-full hover:bg-muted/70 active:bg-muted transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={openPicker}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-muted/70 transition-colors"
          >
            <span className="text-[16px] font-bold tracking-tight">
              {format(currentMonth, "yyyy년 M월", { locale: ko })}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
          </button>

          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-2 rounded-full hover:bg-muted/70 active:bg-muted transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 수입/지출 전환 탭 */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab("income")}
          className={cn(
            "flex-1 py-3 text-center text-[13px] font-semibold transition-all relative",
            activeTab === "income" ? "text-income" : "text-muted-foreground/50"
          )}
        >
          수입
          {activeTab === "income" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-income rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={cn(
            "flex-1 py-3 text-center text-[13px] font-semibold transition-all relative",
            activeTab === "expense" ? "text-expense" : "text-muted-foreground/50"
          )}
        >
          지출
          {activeTab === "expense" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-expense rounded-full" />
          )}
        </button>
      </div>

      {/* 총 금액 표시 */}
      <div className="text-center pt-7 pb-4 px-5">
        <p className="text-[10.5px] text-muted-foreground/70 font-semibold uppercase tracking-widest mb-2.5">
          이번 달 총 {isExpense ? "지출" : "수입"}
        </p>
        <p className={cn(
          "text-[2.2rem] font-bold tabular-nums tracking-tight leading-none",
          isExpense ? "text-expense" : "text-income"
        )}>
          {total.toLocaleString("ko-KR")}
          <span className="text-[1.5rem] font-semibold ml-1">원</span>
        </p>
      </div>

      {/* 도넛 차트 */}
      <DonutChart
        data={chartData}
        total={total}
        onCategoryClick={(item) => {
          if (item.id) {
            setDetailCategoryId(item.id);
            setDetailOpen(true);
          }
        }}
      />

      {/* 월별 추이 차트 */}
      <div className="mt-2 mx-4 mb-2 rounded-2xl border border-border/40 bg-muted/20 overflow-hidden">
        {trendLoading ? (
          <div className="px-4 pt-4 pb-3">
            {/* 헤더 스켈레톤 */}
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 rounded-full bg-muted animate-pulse" />
              <div className="flex gap-1.5">
                <div className="h-6 w-10 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-10 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-8 rounded-full bg-muted animate-pulse" />
              </div>
            </div>
            {/* 차트 영역 스켈레톤 */}
            <div className="h-[160px] flex items-end gap-2 px-2 pb-1">
              {[45, 35, 55, 40, 70, 50, 60, 38, 65, 42, 58, 48].slice(0, trendCount).map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-muted animate-pulse"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <MonthlyTrendChart
            data={trendData}
            activeTab={activeTab}
            currentYear={currentMonth.getFullYear()}
            currentMonth={currentMonth.getMonth() + 1}
            count={trendCount}
            onCountChange={setTrendCount}
            onBarClick={(year, month) => setCurrentMonth(new Date(year, month - 1, 1))}
          />
        )}
      </div>

      {/* 카테고리 상세 드로어 */}
      <CategoryDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        categoryId={detailCategoryId}
        initialMonth={currentMonth}
        type={activeTab}
        categories={categories}
      />

      {/* 월 선택 팝업 */}
      {isPickerOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsPickerOpen(false)} />
          <div className="fixed left-1/2 -translate-x-1/2 z-40 bg-background border border-border/60 rounded-2xl shadow-xl shadow-foreground/8 p-5 w-[21rem]" style={{ top: "calc(3.25rem + env(safe-area-inset-top))" }}>
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
