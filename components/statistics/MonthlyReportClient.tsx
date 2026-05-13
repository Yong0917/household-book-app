"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportData } from "@/lib/actions/reports";
import { ChangeBadge } from "./ChangeBadge";
import { AssetBreakdownCard } from "./AssetBreakdownCard";
import { TopTransactionsCard } from "./TopTransactionsCard";

const DailyExpenseChart = dynamic(
  () => import("./DailyExpenseChart").then((m) => m.DailyExpenseChart),
  { ssr: false, loading: () => <div className="h-[140px]" /> }
);

const WeekdayExpenseChart = dynamic(
  () => import("./WeekdayExpenseChart").then((m) => m.WeekdayExpenseChart),
  { ssr: false, loading: () => <div className="h-[120px]" /> }
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

interface Props {
  data: ReportData | null;
  year: number;
  month: number;
  prevLink: string | null;
  nextLink: string | null;
}

export function MonthlyReportClient({ data, year, month, prevLink, nextLink }: Props) {
  const isEmpty = !data || data.transactionCount === 0;
  const netAmount = data ? data.totalIncome - data.totalExpense : 0;

  const savingsRate =
    data && data.totalIncome > 0
      ? Math.round(((data.totalIncome - data.totalExpense) / data.totalIncome) * 100)
      : null;

  const savingsRateBarWidth =
    savingsRate !== null ? Math.min(Math.max(savingsRate, 0), 100) : 0;

  const savingsRateColor =
    savingsRate === null ? ""
    : savingsRate >= 30 ? "text-income"
    : savingsRate >= 10 ? "text-amber-500 dark:text-amber-400"
    : "text-expense";

  const savingsRateBarColor =
    savingsRate === null ? ""
    : savingsRate >= 30 ? "bg-income"
    : savingsRate >= 10 ? "bg-amber-500 dark:bg-amber-400"
    : "bg-expense";

  // 이상치: 이번 달 평균 거래액의 3배 초과한 지출 거래
  const outlierCount = (() => {
    if (!data || data.transactionCount === 0) return 0;
    const avgTx = data.totalExpense / data.transactionCount;
    return data.topTransactions.filter((tx) => tx.amount > avgTx * 3).length;
  })();

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── 헤더 ─────────────────────────────────────── */}
      <div
        className="relative flex items-center px-4 pb-3 border-b border-border/40"
        style={{ paddingTop: `calc(env(safe-area-inset-top) + 1rem)` }}
      >
        <Link
          href="/settings/reports"
          className="p-1.5 -ml-1.5 rounded-full hover:bg-muted/60 active:bg-muted/80 transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h1 className="absolute inset-x-0 text-center text-base font-semibold pointer-events-none">
          {year}년 {month}월 결산
        </h1>
        <div className="ml-auto flex items-center gap-0.5 z-10">
          {prevLink ? (
            <Link href={prevLink} className="p-1.5 rounded-full hover:bg-muted/60 active:bg-muted/80 transition-colors" aria-label="이전 달">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
          ) : (
            <span className="w-7 h-7 flex items-center justify-center opacity-20">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </span>
          )}
          {nextLink ? (
            <Link href={nextLink} className="p-1.5 rounded-full hover:bg-muted/60 active:bg-muted/80 transition-colors" aria-label="다음 달">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ) : (
            <span className="w-7 h-7 flex items-center justify-center opacity-20">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </span>
          )}
        </div>
      </div>

      {/* ── 거래 없는 달 ──────────────────────────────── */}
      {isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <p className="text-sm">이 달의 거래 내역이 없어요</p>
          <Link href="/ledger/daily" className="text-xs text-primary underline underline-offset-2">
            가계부로 이동
          </Link>
        </div>
      )}

      {/* ── 리포트 내용 ───────────────────────────────── */}
      {data && !isEmpty && (
        <div className="flex flex-col gap-4 px-4 py-4 pb-24">

          {/* ① 요약 카드 */}
          <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              이달 요약
            </p>
            <div className="flex flex-col gap-3">

              {/* 수입 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm text-muted-foreground">수입</span>
                  <ChangeBadge
                    current={data.totalIncome}
                    prev={data.prevMonthIncome}
                    invertColor
                  />
                </div>
                <span className="text-sm font-semibold text-income tabular-nums shrink-0">
                  +{data.totalIncome.toLocaleString("ko-KR")}원
                </span>
              </div>

              {/* 지출 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm text-muted-foreground">지출</span>
                    <ChangeBadge current={data.totalExpense} prev={data.prevMonthExpense} />
                  </div>
                  {data.avg3Expense > 0 && (
                    <ChangeBadge
                      current={data.totalExpense}
                      prev={data.avg3Expense}
                      label="3개월 평균 대비"
                      className="self-start"
                    />
                  )}
                </div>
                <span className="text-sm font-semibold text-expense tabular-nums shrink-0">
                  -{data.totalExpense.toLocaleString("ko-KR")}원
                </span>
              </div>

              {/* 순합계 */}
              <div className="border-t border-border/40 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold">순합계</span>
                <span className={cn("text-sm font-bold tabular-nums", netAmount > 0 ? "text-income" : netAmount < 0 ? "text-expense" : "text-foreground")}>
                  {netAmount > 0 ? "+" : ""}{netAmount.toLocaleString("ko-KR")}원
                </span>
              </div>

              {/* 저축률 */}
              {savingsRate !== null && (
                <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">저축률</span>
                    <span className={cn("text-sm font-bold tabular-nums", savingsRateColor)}>
                      {savingsRate}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", savingsRateBarColor)}
                      style={{ width: `${savingsRateBarWidth}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ② 자산별 변동 */}
          <AssetBreakdownCard assets={data.assetBreakdown} />

          {/* ④ 일별 지출 차트 */}
          {data.dailyExpenses.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
                일별 지출
              </p>
              <DailyExpenseChart data={data.dailyExpenses} year={year} month={month} />
            </div>
          )}

          {/* ⑤ 요일별 지출 패턴 */}
          {data.weekdayExpenses.length > 0 && data.totalExpense > 0 && (
            <div className="rounded-2xl bg-card border border-border/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
                요일별 지출
              </p>
              <WeekdayExpenseChart
                data={data.weekdayExpenses}
                peakWeekday={data.peakWeekday}
              />
            </div>
          )}

          {/* ⑥ 카테고리 TOP */}
          {data.topCategories.length > 0 && (
            <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                카테고리별 지출 TOP {data.topCategories.length}
              </p>
              <div className="flex flex-col gap-1">
                {data.topCategories.map((cat) => {
                  const pct = data.totalExpense > 0 ? Math.round((cat.amount / data.totalExpense) * 100) : 0;
                  return (
                    <Link
                      key={cat.id}
                      href={`/statistics/category/${cat.id}?month=${year}-${String(month).padStart(2, "0")}`}
                      className="flex flex-col gap-1 -mx-2 px-2 py-2 rounded-xl hover:bg-muted/30 active:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm font-medium truncate">{cat.name}</span>
                          <span className="text-xs text-muted-foreground/60">{cat.count}건</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs text-muted-foreground/60">{pct}%</span>
                          <span className="text-sm font-semibold tabular-nums">{cat.amount.toLocaleString("ko-KR")}원</span>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ⑦ Top 5 큰 거래 */}
          <TopTransactionsCard transactions={data.topTransactions} />

          {/* ⑧ 소비 패턴 인사이트 */}
          <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              이달의 소비 패턴
            </p>
            <div className="flex flex-col gap-3">
              <InsightRow
                icon="📅"
                label="가장 많이 쓴 날"
                value={data.peakDay !== null ? `${data.peakDay}일` : "정보 없음"}
              />
              <InsightRow
                icon="📆"
                label="가장 많이 쓴 요일"
                value={data.peakWeekday !== null ? `${WEEKDAY_LABELS[data.peakWeekday]}요일` : "정보 없음"}
              />
              <InsightRow icon="🧾" label="총 거래 건수" value={`${data.transactionCount}건`} />
              <InsightRow
                icon="💸"
                label="하루 평균 지출"
                value={formatAmount(Math.round(data.totalExpense / new Date(year, month, 0).getDate()))}
              />
              {data.maxExpense && (
                <InsightRow
                  icon="💳"
                  label="최대 단일 지출"
                  value={formatAmount(data.maxExpense.amount)}
                  sub={[data.maxExpense.categoryName, data.maxExpense.description, `${data.maxExpense.day}일`].filter(Boolean).join(" · ")}
                />
              )}
              {outlierCount > 0 && (
                <InsightRow
                  icon="⚠️"
                  label="이상치 지출"
                  value={`${outlierCount}건`}
                  sub="평균 거래액의 3배를 넘는 지출"
                />
              )}
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
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base leading-none">{icon}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-sm font-semibold text-right">{value}</span>
        {sub && (
          <span className="text-xs text-muted-foreground/60 text-right leading-tight">{sub}</span>
        )}
      </div>
    </div>
  );
}
