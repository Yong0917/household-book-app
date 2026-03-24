"use client";

// 통계 페이지 - 수입/지출 탭 통합 (기본: 지출)
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, isSameMonth, parseISO, parse, isValid } from "date-fns";
import { useSwipeMonth } from "@/hooks/useSwipeMonth";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DonutChart } from "@/components/statistics/DonutChart";
import { CategoryDetailSheet } from "@/components/statistics/CategoryDetailSheet";
import dynamic from "next/dynamic";
const MonthlyTrendChart = dynamic(
  () => import("@/components/statistics/MonthlyTrendChart").then((m) => ({ default: m.MonthlyTrendChart })),
  { ssr: false }
);
import { getStatisticsPageData } from "@/lib/actions/transactions";
import type { Transaction, Category, TransactionType } from "@/lib/mock/types";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export default function StatisticsPage() {
  return (
    <Suspense fallback={null}>
      <StatisticsContent />
    </Suspense>
  );
}

function parseMonthParam(param: string | null): Date {
  if (!param) return startOfMonth(new Date());
  const parsed = parse(param, "yyyy-MM", new Date());
  return isValid(parsed) ? startOfMonth(parsed) : startOfMonth(new Date());
}

function StatisticsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
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

  // 카테고리 상세 드로어
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCategoryId, setDetailCategoryId] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendData, setTrendData] = useState<{ year: number; month: number; label: string; income: number; expense: number }[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendCount, setTrendCount] = useState(6);

  // 전체 데이터 캐시 (트랜잭션 + 카테고리 + 추이, 달/기간 변경 시 재사용)
  const cacheRef = useRef<Map<string, {
    transactions: Transaction[];
    categories: Category[];
    trend: typeof trendData;
  }>>(new Map());
  // 현재 로딩 중인 키 추적 (중복 호출 방지)
  const fetchingKeyRef = useRef<string | null>(null);

  // 달 또는 추이 기간 변경 시 데이터 단일 조회
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const key = `${format(currentMonth, "yyyy-MM")}-${trendCount}`;

    if (fetchingKeyRef.current === key) return;
    fetchingKeyRef.current = key;

    const cached = cacheRef.current.get(key);
    if (cached) {
      setTransactions(cached.transactions);
      setCategories(cached.categories);
      setTrendData(cached.trend);
      fetchingKeyRef.current = null;
      return;
    }

    setTrendLoading(true);
    getStatisticsPageData(year, month, trendCount).then((data) => {
      cacheRef.current.set(key, data);
      setTransactions(data.transactions);
      setCategories(data.categories);
      setTrendData(data.trend);
      setTrendLoading(false);
      fetchingKeyRef.current = null;
    });
  }, [currentMonth, trendCount]);

  const { onTouchStart, onTouchEnd } = useSwipeMonth(setCurrentMonth, !isPickerOpen);

  const openPicker = () => {
    setPickerYear(currentMonth.getFullYear());
    setIsPickerOpen(true);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(pickerYear, monthIndex, 1));
    setIsPickerOpen(false);
  };

  // 선택된 탭에 맞는 거래 필터링
  const filtered = transactions.filter(
    (t) => t.type === activeTab && isSameMonth(parseISO(t.transactionAt), currentMonth)
  );

  // 카테고리 Map (O(1) 룩업)
  const categoryLookup = new Map(categories.map((c) => [c.id, c]));

  // 카테고리별 집계
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

  const isExpense = activeTab === "expense";

  return (
    <div className="min-h-[calc(100dvh-4rem)]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* 월 이동 헤더 */}
      <header className="sticky top-0 bg-background/96 backdrop-blur-md border-b border-border/50 z-10">
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
          <div className="fixed top-[52px] left-1/2 -translate-x-1/2 z-40 bg-background border border-border/60 rounded-2xl shadow-xl shadow-foreground/8 p-5 w-[21rem]">
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
