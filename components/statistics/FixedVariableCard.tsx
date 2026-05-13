interface Props {
  recurringExpense: number;
  variableExpense: number;
  totalExpense: number;
}

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

export function FixedVariableCard({ recurringExpense, variableExpense, totalExpense }: Props) {
  if (totalExpense === 0) return null;

  const recurringPct = Math.round((recurringExpense / totalExpense) * 100);
  const variablePct = 100 - recurringPct;

  return (
    <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        고정비 vs 변동비
      </p>

      {/* stacked bar */}
      <div className="h-2 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-primary/70 transition-all"
          style={{ width: `${recurringPct}%` }}
        />
        <div
          className="h-full bg-muted/50 flex-1 transition-all"
        />
      </div>

      <div className="flex justify-between text-sm">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary/70 shrink-0" />
            <span className="text-muted-foreground text-xs">고정비</span>
            <span className="text-xs text-muted-foreground/60">{recurringPct}%</span>
          </div>
          <span className="font-semibold tabular-nums pl-3.5">{fmt(recurringExpense)}원</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground/60">{variablePct}%</span>
            <span className="text-muted-foreground text-xs">변동비</span>
            <span className="w-2 h-2 rounded-full bg-muted/50 border border-border shrink-0" />
          </div>
          <span className="font-semibold tabular-nums pr-3.5">{fmt(variableExpense)}원</span>
        </div>
      </div>
    </div>
  );
}
