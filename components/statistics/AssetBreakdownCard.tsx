import { cn } from "@/lib/utils";
import type { AssetBreakdown } from "@/lib/actions/reports";

const ASSET_TYPE_LABEL: Record<string, string> = {
  cash: "현금",
  bank: "은행",
  card: "카드",
  other: "기타",
};

interface Props {
  assets: AssetBreakdown[];
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

export function AssetBreakdownCard({ assets }: Props) {
  if (assets.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        자산별 변동
      </p>
      <div className="flex flex-col gap-2">
        {assets.map((a) => {
          const net = a.income - a.expense;
          return (
            <div key={a.assetId} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-muted-foreground/60 shrink-0">
                  {ASSET_TYPE_LABEL[a.assetType] ?? a.assetType}
                </span>
                <span className="text-sm font-medium truncate">{a.assetName}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums">
                {a.income > 0 && (
                  <span className="text-income">+{fmt(a.income)}</span>
                )}
                {a.expense > 0 && (
                  <span className="text-expense">-{fmt(a.expense)}</span>
                )}
                <span
                  className={cn(
                    "font-semibold text-sm",
                    net > 0 ? "text-income" : net < 0 ? "text-expense" : "text-foreground"
                  )}
                >
                  {net > 0 ? "+" : ""}{fmt(net)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
