"use client";

// 도넛 차트 컴포넌트 (recharts 사용, 정적 마크업)
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BarChart2, Circle } from "lucide-react";

// 슬라이스 외부에 연결선 + 카테고리명 레이블 렌더링
function renderCustomLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  percent,
  color,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  name: string;
  percent: number;
  color: string;
}) {
  const RADIAN = Math.PI / 180;
  const cos = Math.cos(-midAngle * RADIAN);
  const sin = Math.sin(-midAngle * RADIAN);

  // 작은 슬라이스일수록 선을 더 길게 뻗어서 레이블 겹침 방지
  const extraOffset = percent < 0.05 ? 30 : percent < 0.1 ? 15 : 0;

  // 연결선 시작점 (슬라이스 외곽)
  const x1 = cx + (outerRadius + 4) * cos;
  const y1 = cy + (outerRadius + 4) * sin;

  // 꺾이는 중간 지점
  const x2 = cx + (outerRadius + 22 + extraOffset) * cos;
  const y2 = cy + (outerRadius + 22 + extraOffset) * sin;

  // 텍스트 앵커 방향
  const isRight = cos >= 0;
  const x3 = x2 + (isRight ? 10 : -10);

  return (
    <g>
      {/* 슬라이스에서 꺾이는 지점까지 선 */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} />
      {/* 수평 연결선 */}
      <line x1={x2} y1={y2} x2={x3} y2={y2} stroke={color} strokeWidth={1.5} />
      {/* 카테고리명 */}
      <text
        x={x3 + (isRight ? 3 : -3)}
        y={y2}
        textAnchor={isRight ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
        fill={color}
        fontWeight={500}
      >
        {name}
      </text>
    </g>
  );
}

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  total: number;
}

export function DonutChart({ data, total }: DonutChartProps) {
  // 데이터가 없는 경우 빈 상태 표시
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        {/* 빈 상태 아이콘 */}
        <BarChart2 className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-sm">이번 달 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      {/* 도넛 차트 영역 */}
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            dataKey="value"
            strokeWidth={0}
            label={renderCustomLabel}
            labelLine={false}
            animationDuration={300}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* 카테고리 목록 */}
      <div className="mt-4 space-y-3 px-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            {/* 카테고리 색상 아이콘 */}
            <Circle
              className="h-4 w-4 flex-shrink-0"
              style={{ fill: item.color, stroke: item.color }}
            />

            {/* 카테고리명 */}
            <span className="flex-1 ml-3 text-sm">{item.name}</span>

            {/* 금액 */}
            <span className="text-sm font-medium">
              {item.value.toLocaleString("ko-KR")}원
            </span>

            {/* 비율 */}
            <span className="text-xs text-muted-foreground ml-2">
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
