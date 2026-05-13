import type { TopTransaction } from "@/lib/actions/reports";

interface Props {
  transactions: TopTransaction[];
}

function fmt(n: number) {
  if (n >= 10000) {
    const man = Math.floor(n / 10000);
    const rest = n % 10000;
    if (rest === 0) return `${man.toLocaleString("ko-KR")}만원`;
    return `${man.toLocaleString("ko-KR")}만 ${rest.toLocaleString("ko-KR")}원`;
  }
  return `${n.toLocaleString("ko-KR")}원`;
}

export function TopTransactionsCard({ transactions }: Props) {
  if (transactions.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        큰 지출 TOP {transactions.length}
      </p>
      <div className="flex flex-col gap-2">
        {transactions.map((tx, i) => (
          <div key={tx.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-muted-foreground/40 tabular-nums w-4 shrink-0">
                {i + 1}
              </span>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: tx.categoryColor }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {tx.description || tx.categoryName || "미분류"}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  {tx.categoryName && tx.description ? tx.categoryName + " · " : ""}
                  {tx.day}일{tx.assetName ? " · " + tx.assetName : ""}
                </span>
              </div>
            </div>
            <span className="text-sm font-semibold text-expense tabular-nums shrink-0">
              -{fmt(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
