"use client";

// 카테고리 상세 월별 트렌드 라인 차트 (recharts) - dynamic import용 분리 파일
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface TrendPoint {
  month: string;
  total: number;
}

interface Props {
  data: TrendPoint[];
  chartColor: string;
}

function formatYAxis(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

export function CategoryTrendChart({ data, chartColor }: Props) {
  return (
    <div className="px-1 pb-2">
      <ResponsiveContainer width="100%" height={180}>
        <LineChart
          data={data}
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
  );
}
