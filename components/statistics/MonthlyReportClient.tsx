"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportData } from "@/lib/actions/reports";

// 일별 지출 차트는 CSR only (recharts)
const DailyExpenseChart = dynamic(
  () => import("./DailyExpenseChart").then((m) => m.DailyExpenseChart),
  { ssr: false, loading: () => <div className="h-[140px]" /> }
);

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatAmount(amount: number): string {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const rest = amount % 10000;
    if (rest === 0) return `${man.toLocaleString("ko-KR")}만원`;
    return `${man.toLocaleString("ko-KR")}만 ${rest.toLocaleString("ko-KR")}원`;
  }
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatChange(current: number, prev: number | null) {
  if (prev === null || prev === 0) return null;
  const diff = current - prev;
  const pct = Math.round(Math.abs((diff / prev) * 100));
  return { diff, pct, isIncrease: diff > 0 };
}

interface Props {
  data: ReportData | null;
  year: number;
  month: number;
}

export function MonthlyReportClient({ data, year, month }: Props) {
  const isEmpty = !data || data.transactionCount === 0;

  const expenseChange = data
    ? formatChange(data.totalExpense, data.prevMonthExpense)
    : null;

  const netAmount = data ? data.totalIncome - data.totalExpense : 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border/40">
        <Link
          href="/settings/reports"
          className="p-1.5 -ml-1.5 rounded-full hover:bg-muted/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h1 className="text-base font-semibold">
          {year}년 {month}월 결산
        </h1>
      </div>

      {/* 거래 없는 달 */}
      {isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <p className="text-sm">이 달의 거래 내역이 없어요</p>
          <Link
            href="/ledger/daily"
            className="text-xs text-primary underline underline-offset-2"
          >
            가계부로 이동
          </Link>
        </div>
      )}

      {/* 리포트 내용 */}
      {data && !isEmpty && (
        <div className="flex flex-col gap-4 px-4 py-4 pb-24">
          {/* 요약 카드 */}
          <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              이달 요약
            </p>
            <div className="flex flex-col gap-2">
              {/* 수입 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">수입</span>
                <span className="text-sm font-semibold text-income tabular-nums">
                  +{data.totalIncome.toLocaleString("ko-KR")}원
                </span>
              </div>
              {/* 지출 + 전월 대비 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">지출</span>
                  {expenseChange && (
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
                        expenseChange.isIncrease
                          ? "bg-expense/10 text-expense"
                          : "bg-income/10 text-income"
                      )}
                    >
                      {expenseChange.isIncrease ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      전월 대비 {expenseChange.pct}%{" "}
                      {expenseChange.isIncrease ? "증가" : "감소"}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-expense tabular-nums">
                  -{data.totalExpense.toLocaleString("ko-KR")}원
                </span>
              </div>
              {/* 구분선 */}
              <div className="border-t border-border/40 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold">순합계</span>
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    netAmount > 0
                      ? "text-income"
                      : netAmount < 0
                      ? "text-expense"
                      : "text-foreground"
                  )}
                >
                  {netAmount > 0 ? "+" : ""}
                  {netAmount.toLocaleString("ko-KR")}원
                </span>
              </div>
            </div>
          </div>

          {/* 일별 지출 차트 */}
          {data.dailyExpenses.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
                일별 지출
              </p>
              <DailyExpenseChart
                data={data.dailyExpenses}
                year={year}
                month={month}
              />
            </div>
          )}

          {/* 카테고리 TOP 5 */}
          {data.topCategories.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                카테고리별 지출 TOP {data.topCategories.length}
              </p>
              <div className="flex flex-col gap-3">
                {data.topCategories.map((cat) => {
                  const pct =
                    data.totalExpense > 0
                      ? Math.round((cat.amount / data.totalExpense) * 100)
                      : 0;
                  return (
                    <div key={cat.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm font-medium">{cat.name}</span>
                          <span className="text-xs text-muted-foreground/60">
                            {cat.count}건
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground/60">
                            {pct}%
                          </span>
                          <span className="text-sm font-semibold tabular-nums">
                            {cat.amount.toLocaleString("ko-KR")}원
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 소비 패턴 인사이트 */}
          <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              이달의 소비 패턴
            </p>
            <div className="flex flex-col gap-2.5">
              <InsightRow
                icon="📅"
                label="가장 많이 쓴 날"
                value={
                  data.peakDay !== null ? `${data.peakDay}일` : "정보 없음"
                }
              />
              <InsightRow
                icon="📆"
                label="가장 많이 쓴 요일"
                value={
                  data.peakWeekday !== null
                    ? `${WEEKDAY_LABELS[data.peakWeekday]}요일`
                    : "정보 없음"
                }
              />
              <InsightRow
                icon="🧾"
                label="총 거래 건수"
                value={`${data.transactionCount}건`}
              />
              <InsightRow
                icon="💸"
                label="하루 평균 지출"
                value={formatAmount(
                  Math.round(data.totalExpense / new Date(year, month, 0).getDate())
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none">{icon}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
