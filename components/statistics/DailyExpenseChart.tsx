"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import type { DailyExpense } from "@/lib/actions/reports";

interface Props {
  data: DailyExpense[];
  year: number;
  month: number;
}

function formatYAxis(value: number): string {
  if (value === 0) return "0";
  if (value >= 10000) return `${Math.round(value / 10000)}만`;
  if (value >= 1000) return `${Math.round(value / 1000)}천`;
  return String(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { day, amount } = payload[0].payload as DailyExpense;
  return (
    <div className="bg-popover border border-border/40 rounded-lg px-2.5 py-1.5 text-xs shadow-md">
      <p className="text-muted-foreground">{day}일</p>
      <p className="font-semibold tabular-nums">
        {Number(amount).toLocaleString("ko-KR")}원
      </p>
    </div>
  );
}

export function DailyExpenseChart({ data, year, month }: Props) {
  // 해당 월의 전체 일 수 채우기 (거래 없는 날은 0)
  const daysInMonth = new Date(year, month, 0).getDate();
  const fullData: DailyExpense[] = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const found = data.find((d) => d.day === day);
    return { day, amount: found ? found.amount : 0 };
  });

  const maxAmount = Math.max(...fullData.map((d) => d.amount), 1);

  return (
    <ResponsiveContainer width="100%" height={140} style={{ outline: "none" }}>
      <BarChart
        data={fullData}
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        barCategoryGap="15%"
        style={{ outline: "none" }}
        tabIndex={-1}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="currentColor"
          strokeOpacity={0.07}
        />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 9, fill: "currentColor", opacity: 0.45 }}
          axisLine={false}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 9, fill: "currentColor", opacity: 0.45 }}
          axisLine={false}
          tickLine={false}
          width={34}
          domain={[0, Math.ceil(maxAmount * 1.2)]}
          tickCount={4}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={20}>
          {fullData.map((entry) => (
            <Cell
              key={entry.day}
              fill={
                entry.amount > 0
                  ? "var(--color-expense, #f43f5e)"
                  : "color-mix(in srgb, #f43f5e 15%, transparent)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
