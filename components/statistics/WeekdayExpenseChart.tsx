"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { WeekdayExpense } from "@/lib/actions/reports";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

interface Props {
  data: WeekdayExpense[]; // 길이 7, wd 0~6
  peakWeekday: number | null;
}

function fmtY(v: number) {
  if (v >= 10000) return `${Math.round(v / 10000)}만`;
  if (v >= 1000) return `${Math.round(v / 1000)}천`;
  return String(v);
}

export function WeekdayExpenseChart({ data, peakWeekday }: Props) {
  const chartData = data.map((d) => ({
    label: WEEKDAY_LABELS[d.wd],
    amount: d.amount,
    wd: d.wd,
  }));

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={chartData} barSize={24} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={fmtY}
          width={40}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const val = payload[0].value as number;
            return (
              <div className="rounded-lg bg-popover border border-border px-2.5 py-1.5 text-xs shadow-md">
                <span className="font-semibold">{val.toLocaleString("ko-KR")}원</span>
              </div>
            );
          }}
        />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={entry.wd}
              fill={entry.wd === peakWeekday ? "hsl(var(--expense))" : "hsl(var(--primary))"}
              opacity={entry.wd === peakWeekday ? 0.9 : 0.45}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
