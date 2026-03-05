"use client";

// 카테고리 상세 통계 페이지 - 월별 트렌드 + 거래 목록
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
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
import { getCategories } from "@/lib/actions/categories";
import { getAssets } from "@/lib/actions/assets";
import { searchTransactions } from "@/lib/actions/transactions";
import type { Transaction, Category, Asset } from "@/lib/mock/types";

export default function CategoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryId = params.categoryId as string;
  const initialMonth = searchParams.get("month"); // "2026-03"
  const type = (searchParams.get("type") ?? "expense") as "income" | "expense";

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (initialMonth) {
      const [y, m] = initialMonth.split("-").map(Number);
      return startOfMonth(new Date(y, m - 1, 1));
    }
    return startOfMonth(new Date());
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => currentMonth.getFullYear());

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [trendData, setTrendData] = useState<{ month: string; total: number }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const MONTH_LABELS = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ];

  const openPicker = () => {
    setPickerYear(currentMonth.getFullYear());
    setIsPickerOpen(true);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(pickerYear, monthIndex, 1));
    setIsPickerOpen(false);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);

    // 현재 월 포함 이전 7개월 (총 8개월) 범위 조회
    const rangeStart = subMonths(currentMonth, 7);
    const startDate = format(rangeStart, "yyyy-MM-dd");
    const endDate = format(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
      "yyyy-MM-dd"
    );

    const [txs, cats, assetList] = await Promise.all([
      searchTransactions({ categoryIds: [categoryId], startDate, endDate }),
      getCategories(),
      getAssets(),
    ]);

    setCategories(cats);
    setAssets(assetList);

    const typed = txs.filter((t) => t.type === type);
    setAllTransactions(typed);

    // 8개월 트렌드 데이터 생성
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
    loadData();
  }, [loadData]);

  const category = categories.find((c) => c.id === categoryId);

  // 현재 월 거래 필터링
  const monthlyTxs = allTransactions.filter((t) =>
    isSameMonth(parseISO(t.transactionAt), currentMonth)
  );
  const monthlyTotal = monthlyTxs.reduce((sum, t) => sum + t.amount, 0);

  // 날짜별 그룹화 (내림차순)
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

  return (
    <div className="min-h-dvh pb-16">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/60 z-10">
        <div className="flex items-center justify-between px-2 h-12">
          {/* 뒤로가기 + 카테고리명 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-muted/80 transition-colors"
              aria-label="뒤로가기"
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
              onClick={openPicker}
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
      </header>

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
            <LineChart
              data={trendData}
              margin={{ top: 8, right: 16, bottom: 0, left: 4 }}
            >
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
                formatter={(value: number) => [
                  `${value.toLocaleString("ko-KR")}원`,
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

      {/* 거래 목록 (날짜별 그룹화) */}
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
          const dayIncome = dayTxs
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + t.amount, 0);
          const dayExpense = dayTxs
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + t.amount, 0);

          return (
            <div key={dateKey}>
              {/* 날짜 헤더 */}
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

              {/* 거래 아이템들 */}
              {dayTxs
                .sort((a, b) => b.transactionAt.localeCompare(a.transactionAt))
                .map((t) => {
                  const asset = assets.find((a) => a.id === t.assetId);
                  const cat = categories.find((c) => c.id === t.categoryId);
                  const txDate = parseISO(t.transactionAt);
                  const timeStr = format(txDate, "a h:mm", { locale: ko });

                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 px-5 py-3.5 border-b border-border/30"
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
                      <span
                        className={cn(
                          "font-semibold text-[13.5px] tabular-nums flex-shrink-0",
                          accentColor
                        )}
                      >
                        {t.amount.toLocaleString("ko-KR")}원
                      </span>
                    </div>
                  );
                })}
            </div>
          );
        })
      )}
      {/* 월 선택 팝업 */}
      {isPickerOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsPickerOpen(false)} />
          <div className="fixed top-[52px] right-4 z-40 bg-background border border-border/60 rounded-2xl shadow-xl shadow-foreground/8 p-5 w-[21rem]">
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
