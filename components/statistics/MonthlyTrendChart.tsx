"use client";

// 월별 수입/지출 추이 막대 차트 (recharts)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

interface TrendPoint {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
}

const PERIOD_OPTIONS = [
  { label: "3개월", value: 3 },
  { label: "6개월", value: 6 },
  { label: "1년", value: 12 },
] as const;

interface Props {
  data: TrendPoint[];
  activeTab: "income" | "expense";
  currentYear: number;
  currentMonth: number;
  count: number;
  onCountChange: (count: number) => void;
  onBarClick: (year: number, month: number) => void;
}

// 금액을 축 레이블용으로 포맷 (만원 단위)
function formatYAxis(value: number): string {
  if (value === 0) return "0";
  if (value >= 10000) return `${Math.round(value / 10000)}만`;
  if (value >= 1000) return `${Math.round(value / 1000)}천`;
  return String(value);
}

export function MonthlyTrendChart({
  data,
  activeTab,
  currentYear,
  currentMonth,
  count,
  onCountChange,
  onBarClick,
}: Props) {
  const isExpense = activeTab === "expense";
  const barColor = isExpense ? "var(--color-expense, #f43f5e)" : "var(--color-income, #22c55e)";
  const barColorFaded = isExpense
    ? "color-mix(in srgb, #f43f5e 28%, transparent)"
    : "color-mix(in srgb, #22c55e 28%, transparent)";

  const maxValue = Math.max(...data.map((d) => (isExpense ? d.expense : d.income)), 1);

  return (
    <div className="pl-2 pr-4 pt-2 pb-5">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-3 pl-2 pr-1">
        <p className="text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-widest">
          최근 {count === 12 ? "1년" : `${count}개월`} 추이
        </p>
        {/* 기간 선택 버튼 */}
        <div className="flex items-center gap-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onCountChange(opt.value)}
              className={cn(
                "px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors",
                count === opt.value
                  ? isExpense
                    ? "bg-expense/15 text-expense"
                    : "bg-income/15 text-income"
                  : "text-muted-foreground/40 hover:text-muted-foreground/70"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.07} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: count === 12 ? 9 : 11, fill: "currentColor", opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 10, fill: "currentColor", opacity: 0.45 }}
            axisLine={false}
            tickLine={false}
            width={38}
            domain={[0, Math.ceil(maxValue * 1.15)]}
            tickCount={4}
          />
          <ReferenceLine
            y={0}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
          <Bar
            dataKey={isExpense ? "expense" : "income"}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            cursor="pointer"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={(data: any) => onBarClick(data.year, data.month)}
          >
            {data.map((entry) => {
              const isSelected = entry.year === currentYear && entry.month === currentMonth;
              return (
                <Cell
                  key={`${entry.year}-${entry.month}`}
                  fill={isSelected ? barColor : barColorFaded}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 선택된 달 금액 표시 */}
      {(() => {
        const selected = data.find(
          (d) => d.year === currentYear && d.month === currentMonth
        );
        if (!selected) return null;
        const amount = isExpense ? selected.expense : selected.income;
        return (
          <div className="flex items-center justify-between mt-3 pl-2 pr-1">
            <p className="text-[11.5px] text-muted-foreground/60">
              {selected.year}년 {selected.month}월 합계
            </p>
            <p className={cn(
              "text-[13px] font-bold tabular-nums",
              isExpense ? "text-expense" : "text-income"
            )}>
              {amount.toLocaleString("ko-KR")}원
            </p>
          </div>
        );
      })()}
    </div>
  );
}
