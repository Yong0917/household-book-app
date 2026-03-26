"use client";

// 카테고리 상세 통계 전체화면 오버레이 (뒤로가기 지원)
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  parseISO,
  isSameMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { getAssets } from "@/lib/actions/assets";
import { searchTransactions } from "@/lib/actions/transactions";
import { TransactionSheet } from "@/components/ledger/TransactionSheet";
import type { Transaction, Category, Asset } from "@/lib/mock/types";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

interface CategoryDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string | null;
  initialMonth: Date;
  type: "income" | "expense";
  categories: Category[];
}

export function CategoryDetailSheet({
  open,
  onOpenChange,
  categoryId,
  initialMonth,
  type,
  categories,
}: CategoryDetailSheetProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => initialMonth.getFullYear());

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [trendData, setTrendData] = useState<{ month: string; total: number }[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 거래 수정 시트
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // open될 때 초기 월 동기화
  useEffect(() => {
    if (open) {
      setCurrentMonth(initialMonth);
      setPickerYear(initialMonth.getFullYear());
    }
  }, [open, initialMonth]);

  // 히스토리 스택으로 뒤로가기 지원
  useEffect(() => {
    if (!open) return;
    history.pushState({ categoryDetail: true }, "");

    const handlePop = (e: PopStateEvent) => {
      // TransactionSheet 등 내부 시트가 닫히면서 categoryDetail 상태로 돌아오는 경우는 무시
      if (e.state?.categoryDetail) return;
      onOpenChange(false);
      window.removeEventListener("popstate", handlePop);
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [open, onOpenChange]);

  const handleClose = () => {
    if (history.state?.categoryDetail) history.back();
    else onOpenChange(false);
  };

  const loadData = useCallback(async () => {
    if (!categoryId) return;
    setIsLoading(true);

    const rangeStart = subMonths(currentMonth, 7);
    const startDate = format(rangeStart, "yyyy-MM-dd");
    const endDate = format(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
      "yyyy-MM-dd"
    );

    const [txs, assetList] = await Promise.all([
      searchTransactions({ categoryIds: [categoryId], startDate, endDate }),
      getAssets(),
    ]);

    setAssets(assetList);

    const typed = txs.filter((t) => t.type === type);
    setAllTransactions(typed);

    const trend = [];
    for (let i = 7; i >= 0; i--) {
      const m = subMonths(currentMonth, i);
      const monthTotal = typed
        .filter((t) => isSameMonth(parseISO(t.transactionAt), m))
        .reduce((sum, t) => sum + t.amount, 0);
      trend.push({ month: format(m, "M월"), total: monthTotal });
    }
    setTrendData(trend);
    setIsLoading(false);
  }, [categoryId, currentMonth, type]);

  useEffect(() => {
    if (open && categoryId) loadData();
  }, [open, loadData, categoryId]);

  const category = categories.find((c) => c.id === categoryId);
  const monthlyTxs = allTransactions.filter((t) =>
    isSameMonth(parseISO(t.transactionAt), currentMonth)
  );
  const monthlyTotal = monthlyTxs.reduce((sum, t) => sum + t.amount, 0);

  const grouped = monthlyTxs.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = format(parseISO(t.transactionAt), "yyyy-MM-dd");
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort().reverse();

  const isExpense = type === "expense";
  const accentColor = isExpense ? "text-expense" : "text-income";
  const chartColor = isExpense ? "#c9581a" : "#388e5a";

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return String(value);
  };

  if (!open && !isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-background flex flex-col"
      style={{
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
    >
      <div className="h-[env(safe-area-inset-top)] flex-shrink-0" />
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 h-13 flex-shrink-0 border-b border-border/40 bg-background/96 backdrop-blur-md">
        {/* 닫기 + 카테고리명 */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
            aria-label="닫기"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {category && (
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
            )}
            <span className="font-semibold text-[15px]">
              {category?.name ?? "카테고리"}
            </span>
          </div>
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setPickerYear(currentMonth.getFullYear());
              setIsPickerOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <span className="text-[13px] font-medium tabular-nums">
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
      </div>

      {/* 스크롤 가능한 본문 */}
      <div className="overflow-y-auto flex-1 pb-6">
            {/* 월 총액 */}
            <div className="px-5 pt-5 pb-3">
              <p className="text-[11px] text-muted-foreground mb-1.5 tracking-wide">월총액</p>
              {isLoading ? (
                <div className="h-9 w-40 bg-muted-foreground/10 rounded animate-pulse" />
              ) : (
                <p className={cn("text-[2rem] font-bold tabular-nums tracking-tight", accentColor)}>
                  {monthlyTotal.toLocaleString("ko-KR")}원
                </p>
              )}
            </div>

            {/* 8개월 트렌드 라인 차트 */}
            {!isLoading && (
              <div className="px-1 pb-2">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: 4 }}>
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatYAxis}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [
                        value != null ? `${Number(value).toLocaleString("ko-KR")}원` : "",
                        "",
                      ]}
                      labelStyle={{ color: "#9ca3af", fontSize: 11 }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="linear"
                      dataKey="total"
                      stroke={chartColor}
                      strokeWidth={2}
                      dot={{ r: 4, fill: chartColor, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 거래 목록 */}
            {isLoading ? (
              <div className="px-5 space-y-3 pt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-muted-foreground/10 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : sortedDates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-sm">이번 달 내역이 없습니다</p>
              </div>
            ) : (
              sortedDates.map((dateKey) => {
                const dayTxs = grouped[dateKey];
                const date = parseISO(dateKey);
                const dayIncome = dayTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
                const dayExpense = dayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

                return (
                  <div key={dateKey}>
                    <div className="flex items-baseline gap-2 px-5 py-2.5 border-b border-border/40 bg-muted/20">
                      <span className="text-[22px] font-bold tabular-nums leading-none">
                        {format(date, "dd")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(date, "EEEE", { locale: ko })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(date, "yyyy.MM")}
                      </span>
                      <div className="flex-1" />
                      {dayIncome > 0 && (
                        <span className="text-xs text-income tabular-nums">
                          {dayIncome.toLocaleString("ko-KR")}원
                        </span>
                      )}
                      {dayExpense > 0 && (
                        <span className="text-xs text-expense tabular-nums">
                          {dayExpense.toLocaleString("ko-KR")}원
                        </span>
                      )}
                    </div>

                    {dayTxs
                      .sort((a, b) => b.transactionAt.localeCompare(a.transactionAt))
                      .map((t) => {
                        const asset = assets.find((a) => a.id === t.assetId);
                        const cat = categories.find((c) => c.id === t.categoryId);
                        const timeStr = format(parseISO(t.transactionAt), "a h:mm", { locale: ko });

                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              setSelectedTx(t);
                              setEditSheetOpen(true);
                            }}
                            className="flex items-center gap-3 px-5 py-3.5 border-b border-border/30 w-full text-left active:bg-muted/40 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-muted-foreground leading-none mb-0.5">
                                {cat?.name}
                              </p>
                              <p className="font-semibold text-[13.5px] leading-snug truncate">
                                {t.description || cat?.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {timeStr} · {asset?.name}
                              </p>
                            </div>
                            <span className={cn("font-semibold text-[13.5px] tabular-nums flex-shrink-0", accentColor)}>
                              {t.amount.toLocaleString("ko-KR")}원
                            </span>
                          </button>
                        );
                      })}
                  </div>
                );
              })
            )}
          </div>

      {/* 거래 수정 시트 */}
      <TransactionSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        mode="edit"
        transaction={selectedTx ?? undefined}
        initialDate={selectedTx ? selectedTx.transactionAt.substring(0, 10) : ""}
        categories={categories}
        assets={assets}
        onSuccess={loadData}
      />

      {/* 월 선택 팝업 */}
      {isPickerOpen && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setIsPickerOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-background border border-border/60 rounded-2xl shadow-xl p-5 w-[21rem]">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setPickerYear((y) => y - 1)} className="p-2 rounded-full hover:bg-muted/80 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[15px] font-semibold">{pickerYear}년</span>
              <button onClick={() => setPickerYear((y) => y + 1)} className="p-2 rounded-full hover:bg-muted/80 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MONTH_LABELS.map((label, idx) => {
                const isSelected = pickerYear === currentMonth.getFullYear() && idx === currentMonth.getMonth();
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentMonth(new Date(pickerYear, idx, 1));
                      setIsPickerOpen(false);
                    }}
                    className={cn(
                      "py-4 rounded-xl text-[13px] font-medium transition-all",
                      isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted/80 text-foreground active:scale-[0.97]"
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
