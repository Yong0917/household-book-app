"use client";

// 파이 차트 컴포넌트 (커스텀 SVG, 레이블 겹침 방지)
import { useEffect, useState } from "react";
import { BarChart2 } from "lucide-react";

export interface DonutChartData {
  id?: string;
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  total: number;
  onCategoryClick?: (item: DonutChartData) => void;
}

// SVG viewBox 상수
const VW = 440;
const VH = 340;
const CX = VW / 2;   // 220
const CY = VH / 2;   // 170
const R = 100;       // 파이 반지름
const L1 = R + 8;    // 연결선 시작 거리
const L2 = R + 28;   // 연결선 꺾임 거리
const LH = 14;       // 수평 연장 길이
const MIN_GAP = 30;  // 레이블 최소 수직 간격

// 극좌표 → 데카르트 (0도 = 12시 방향)
function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// 파이 슬라이스 path 생성
function slicePath(startDeg: number, endDeg: number) {
  if (endDeg - startDeg >= 359.99) {
    // 원 전체
    return `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX - 0.001} ${CY - R} Z`;
  }
  const s = polar(R, startDeg);
  const e = polar(R, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

// 레이블 겹침 방지: 위에서 아래로 간격 확보 후 아래에서 위로 재조정
function resolveOverlaps(items: { adjustedY: number }[]) {
  for (let i = 1; i < items.length; i++) {
    if (items[i].adjustedY - items[i - 1].adjustedY < MIN_GAP) {
      items[i].adjustedY = items[i - 1].adjustedY + MIN_GAP;
    }
  }
  for (let i = items.length - 2; i >= 0; i--) {
    if (items[i + 1].adjustedY - items[i].adjustedY < MIN_GAP) {
      items[i].adjustedY = items[i + 1].adjustedY - MIN_GAP;
    }
  }
}

export function DonutChart({ data, total, onCategoryClick }: DonutChartProps) {
  // 0 → 1 애니메이션 (cubic ease-out)
  const [progress, setProgress] = useState(0);

  // data 참조가 바뀌어도 실제 값이 같으면 애니메이션 재실행 방지
  const dataKey = data.map((d) => `${d.id ?? d.name}:${d.value}`).join(",");

  useEffect(() => {
    setProgress(0);
    let raf: number;
    const start = performance.now();
    const duration = 700;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <BarChart2 className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-sm">이번 달 내역이 없습니다</p>
      </div>
    );
  }

  // 슬라이스 각도 계산 (애니메이션 적용)
  const totalFilled = 360 * progress;
  let cum = 0;
  const slices = data.map((d) => {
    const pct = total > 0 ? d.value / total : 0;
    const sweep = pct * 360;
    const startDeg = cum;
    const midDeg = cum + sweep / 2;
    const endDeg = Math.min(cum + sweep, totalFilled);
    cum += sweep;
    return { ...d, pct, startDeg, endDeg, midDeg, visible: totalFilled > startDeg };
  });

  // 레이블 위치 계산 (애니메이션 완료 전에는 숨김)
  const labelOpacity = Math.max(0, (progress - 0.75) / 0.25);

  type LabelEntry = {
    d: typeof slices[0];
    isRight: boolean;
    naturalY: number;
    adjustedY: number;
    bendX: number;
    midDegRad: number;
  };

  const labels: LabelEntry[] = slices.map((s) => {
    const rad = ((s.midDeg - 90) * Math.PI) / 180;
    const bx = CX + L2 * Math.cos(rad);
    const by = CY + L2 * Math.sin(rad);
    return {
      d: s,
      isRight: Math.cos(rad) >= 0,
      naturalY: by,
      adjustedY: by,
      bendX: bx,
      midDegRad: rad,
    };
  });

  const right = labels.filter((l) => l.isRight).sort((a, b) => a.naturalY - b.naturalY);
  const left = labels.filter((l) => !l.isRight).sort((a, b) => a.naturalY - b.naturalY);
  resolveOverlaps(right);
  resolveOverlaps(left);

  return (
    <div>
      {/* 커스텀 SVG 파이 차트 */}
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ maxHeight: 340 }}>
        {/* 슬라이스 */}
        {slices.map((s, i) =>
          s.visible && s.endDeg > s.startDeg ? (
            <path
              key={i}
              d={slicePath(s.startDeg, s.endDeg)}
              fill={s.color}
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={1.5}
              style={{ cursor: "pointer" }}
              onClick={() => onCategoryClick?.(s)}
            />
          ) : null
        )}

        {/* 레이블 (애니메이션 후 페이드인) */}
        {[...right, ...left].map((l, i) => {
          const cos = Math.cos(l.midDegRad);
          const sin = Math.sin(l.midDegRad);
          const p1 = { x: CX + L1 * cos, y: CY + L1 * sin };
          const hx = l.bendX + (l.isRight ? LH : -LH);
          const textX = hx + (l.isRight ? 4 : -4);
          const anchor = l.isRight ? "start" : "end";

          return (
            <g key={i} opacity={labelOpacity}>
              <polyline
                points={`${p1.x},${p1.y} ${l.bendX},${l.adjustedY} ${hx},${l.adjustedY}`}
                fill="none"
                stroke={l.d.color}
                strokeWidth={1.2}
                strokeOpacity={0.75}
              />
              <text x={textX} y={l.adjustedY - 7} textAnchor={anchor} fontSize={11.5} fill="white" fontWeight={600}>
                {l.d.name}
              </text>
              <text x={textX} y={l.adjustedY + 8} textAnchor={anchor} fontSize={11} fill="rgba(255,255,255,0.55)">
                {(l.d.pct * 100).toFixed(1)} %
              </text>
            </g>
          );
        })}
      </svg>

      {/* 카테고리 목록 - 항목 사이 구분선 */}
      <div className="px-4 pb-4">
        {data.map((item, index) => (
          <button
            key={index}
            onClick={() => onCategoryClick?.(item)}
            className="flex items-center justify-between w-full py-3.5 px-1 active:bg-muted/50 transition-colors"
            style={{
              borderBottom: index < data.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}
          >
            <span className="h-[14px] w-[14px] rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="flex-1 ml-3 text-[13.5px] text-left font-medium">{item.name}</span>
            <span className="text-[13.5px] font-semibold tabular-nums">
              {item.value.toLocaleString("ko-KR")}원
            </span>
            <span className="text-[12px] text-muted-foreground ml-3 w-8 text-right tabular-nums">
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
