import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  current: number;
  prev: number | null | undefined;
  label?: string; // e.g. "전월 대비" | "3개월 평균 대비"
  invertColor?: boolean; // 수입은 증가가 좋음(green), 지출은 증가가 나쁨(red)
  className?: string;
}

export function ChangeBadge({ current, prev, label = "", invertColor = false, className }: Props) {
  if (!prev || prev === 0) return null;
  const diff = current - prev;
  if (diff === 0) return null;
  const pct = Math.round(Math.abs((diff / prev) * 100));
  const isIncrease = diff > 0;
  const isGood = invertColor ? isIncrease : !isIncrease;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap",
        isGood ? "bg-income/10 text-income" : "bg-expense/10 text-expense",
        className
      )}
    >
      {isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {label ? `${label} ` : ""}{pct}%
    </span>
  );
}
