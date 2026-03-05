"use client";

// 지출 통계 뷰 컴포넌트 - Supabase 연동
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, isSameMonth, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DonutChart, DonutChartData } from "@/components/statistics/DonutChart";
import { getTransactionsByMonth } from "@/lib/actions/transactions";
import { getCategories } from "@/lib/actions/categories";
import { getAssets } from "@/lib/actions/assets";
import type { Transaction, Category, Asset } from "@/lib/mock/types";
import { Drawer } from "vaul";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export function ExpenseView() {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const pathname = usePathname();

  // 서버에서 가져온 데이터
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 카테고리 상세 드로어
  const [selectedCategory, setSelectedCategory] = useState<DonutChartData | null>(null);

  // 데이터 로드
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const [txs, cats, assetList] = await Promise.all([
      getTransactionsByMonth(year, month),
      getCategories(),
      getAssets(),
    ]);
    setTransactions(txs);
    setCategories(cats);
    setAssets(assetList);
    setIsLoading(false);
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

  // 현재 월 지출 거래 필터링
  const filtered = transactions.filter(
    (t) => t.type === "expense" && isSameMonth(parseISO(t.transactionAt), currentMonth)
  );

  // 카테고리별 집계
  const categoryMap = new Map<string, number>();
  filtered.forEach((t) => {
    categoryMap.set(t.categoryId, (categoryMap.get(t.categoryId) ?? 0) + t.amount);
  });

  // DonutChart 데이터 생성 (금액 내림차순 정렬)
  const chartData = Array.from(categoryMap.entries())
    .map(([catId, value]) => {
      const cat = categories.find((c) => c.id === catId);
      return { id: catId, name: cat?.name ?? "기타", value, color: cat?.color ?? "#6b7280" };
    })
    .sort((a, b) => b.value - a.value);

  // 총 지출
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      {/* 월 이동 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/60 z-10">
        <div className="flex items-center justify-center gap-0.5 px-4 h-12">
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

          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 수입/지출 전환 탭 */}
      <div className="flex border-b border-border/40">
        <Link
          href="/statistics/income"
          className={cn(
            "flex-1 py-3 text-center text-[12.5px] font-semibold transition-colors relative tracking-tight",
            pathname === "/statistics/income"
              ? "text-income"
              : "text-muted-foreground/40"
          )}
        >
          수입
          {pathname === "/statistics/income" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-income rounded-full" />
          )}
        </Link>
        <Link
          href="/statistics/expense"
          className={cn(
            "flex-1 py-3 text-center text-[12.5px] font-semibold transition-colors relative tracking-tight",
            pathname === "/statistics/expense"
              ? "text-expense"
              : "text-muted-foreground/40"
          )}
        >
          지출
          {pathname === "/statistics/expense" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-expense rounded-full" />
          )}
        </Link>
      </div>

      {/* 총 지출 금액 표시 */}
      <div className="text-center py-6 px-5">
        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.14em] font-bold mb-2.5">이번 달 총 지출</p>
        {isLoading ? (
          <div className="h-10 w-36 bg-muted-foreground/10 rounded-lg animate-pulse mx-auto" />
        ) : (
          <p className="text-[2rem] font-bold text-expense tabular-nums tracking-tight">
            {total.toLocaleString("ko-KR")}
            <span className="text-[1.4rem] font-semibold ml-1">원</span>
          </p>
        )}
      </div>

      {/* 도넛 차트 */}
      {isLoading ? (
        <div className="flex flex-col items-center gap-6 px-5 py-4">
          <div className="h-44 w-44 rounded-full border-[22px] border-muted-foreground/10 animate-pulse" />
          <div className="w-full flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-muted-foreground/10 animate-pulse flex-shrink-0" />
                <div className="h-3 flex-1 bg-muted-foreground/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted-foreground/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DonutChart data={chartData} total={total} onCategoryClick={setSelectedCategory} />
      )}

      {/* 카테고리 상세 드로어 */}
      <Drawer.Root open={!!selectedCategory} onOpenChange={(open) => { if (!open) setSelectedCategory(null); }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background rounded-t-2xl max-h-[80vh]">
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedCategory?.color }}
                />
                <span className="font-semibold text-[15px]">{selectedCategory?.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-expense tabular-nums">
                  {selectedCategory?.value.toLocaleString("ko-KR")}원
                </span>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-1.5 rounded-full hover:bg-muted/80 transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* 거래 목록 */}
            <div className="overflow-y-auto flex-1 pb-8">
              {filtered
                .filter((t) => t.categoryId === selectedCategory?.id)
                .sort((a, b) => b.transactionAt.localeCompare(a.transactionAt))
                .map((t) => {
                  const asset = assets.find((a) => a.id === t.assetId);
                  const cat = categories.find((c) => c.id === t.categoryId);
                  const date = parseISO(t.transactionAt);
                  return (
                    <div key={t.id} className="flex items-center gap-3.5 px-5 py-3.5 border-b border-border/40">
                      {/* 날짜 */}
                      <div className="text-center flex-shrink-0 w-8">
                        <p className="text-xs text-muted-foreground">{format(date, "M/d")}</p>
                        <p className="text-[10px] text-muted-foreground/60">{format(date, "HH:mm")}</p>
                      </div>

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[13.5px] leading-snug truncate">
                          {t.description || cat?.name}
                        </p>
                        <p className="text-[11.5px] text-muted-foreground truncate mt-0.5">
                          {t.description ? `${cat?.name} · ` : ""}{asset?.name}
                        </p>
                      </div>

                      {/* 금액 */}
                      <span className="font-semibold text-[13.5px] tabular-nums text-expense flex-shrink-0">
                        −{t.amount.toLocaleString("ko-KR")}원
                      </span>
                    </div>
                  );
                })}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* 월 선택 팝업 */}
      {isPickerOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsPickerOpen(false)} />
          <div className="fixed top-[52px] left-1/2 -translate-x-1/2 z-40 bg-background border border-border/60 rounded-2xl shadow-xl shadow-foreground/8 p-5 w-[21rem]">
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
    </>
  );
}
