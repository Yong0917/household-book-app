"use client";

// 통계 페이지 - 수입/지출 탭 통합 (기본: 지출)
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, isSameMonth, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DonutChart } from "@/components/statistics/DonutChart";
import { CategoryDetailSheet } from "@/components/statistics/CategoryDetailSheet";
import { getTransactionsByMonth } from "@/lib/actions/transactions";
import { getCategories } from "@/lib/actions/categories";
import type { Transaction, Category, TransactionType } from "@/lib/mock/types";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());

  // 카테고리 상세 드로어
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCategoryId, setDetailCategoryId] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // 월별 트랜잭션 캐시
  const txCacheRef = useRef<Map<string, Transaction[]>>(new Map());
  // categories는 한 번만 로드
  const catsRef = useRef<Category[]>([]);

  const loadData = useCallback(async () => {
    const key = format(currentMonth, "yyyy-MM");
    const cached = txCacheRef.current.get(key);
    const hasCategories = catsRef.current.length > 0;

    if (cached && hasCategories) {
      setTransactions(cached);
      return;
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    if (cached) {
      const cats = await getCategories();
      catsRef.current = cats;
      setCategories(cats);
      setTransactions(cached);
    } else if (hasCategories) {
      const txs = await getTransactionsByMonth(year, month);
      txCacheRef.current.set(key, txs);
      setTransactions(txs);
    } else {
      const [txs, cats] = await Promise.all([
        getTransactionsByMonth(year, month),
        getCategories(),
      ]);
      txCacheRef.current.set(key, txs);
      catsRef.current = cats;
      setTransactions(txs);
      setCategories(cats);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // 카테고리별 집계
  const categoryMap = new Map<string, number>();
  filtered.forEach((t) => {
    categoryMap.set(t.categoryId, (categoryMap.get(t.categoryId) ?? 0) + t.amount);
  });

  const chartData = Array.from(categoryMap.entries())
    .map(([catId, value]) => {
      const cat = categories.find((c) => c.id === catId);
      return { id: catId, name: cat?.name ?? "기타", value, color: cat?.color ?? "#6b7280" };
    })
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const isExpense = activeTab === "expense";

  return (
    <>
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
    </>
  );
}
