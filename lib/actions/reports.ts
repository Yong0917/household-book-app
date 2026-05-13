"use server";

import { createClient } from "@/lib/supabase/server";

// =============================================
// 타입 정의
// =============================================

export type TopCategory = {
  id: string;
  name: string;
  color: string;
  amount: number;
  count: number;
  prevAmount?: number; // 전월 같은 카테고리 지출 (비교용)
};

export type DailyExpense = {
  day: number;
  amount: number;
};

export type WeekdayExpense = {
  wd: number; // 0=일, 1=월 ... 6=토
  amount: number;
};

export type MaxExpense = {
  amount: number;
  description: string | null;
  categoryName: string;
  categoryColor: string;
  day: number;
};

export type AssetBreakdown = {
  assetId: string;
  assetName: string;
  assetType: string;
  income: number;
  expense: number;
  count: number;
};

export type TopTransaction = {
  id: string;
  amount: number;
  description: string | null;
  day: number;
  categoryName: string;
  categoryColor: string;
  assetName: string;
};

export type ReportData = {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  topCategories: TopCategory[];
  peakDay: number | null;
  peakWeekday: number | null; // 0=일, 1=월 ... 6=토
  dailyExpenses: DailyExpense[];
  maxExpense: MaxExpense | null;
  // 비교 지표
  prevMonthIncome: number;
  prevMonthExpense: number;
  avg3Income: number;
  avg3Expense: number;
  prevYearIncome: number | null;
  prevYearExpense: number | null;
  // 자산별 변동
  assetBreakdown: AssetBreakdown[];
  // 고정비 vs 변동비
  recurringExpense: number;
  variableExpense: number;
  recurringIncome: number;
  variableIncome: number;
  // 요일별 지출 (7개, 없는 요일은 0)
  weekdayExpenses: WeekdayExpense[];
  // Top 5 개별 거래
  topTransactions: TopTransaction[];
};

export type ReportListItem = {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
};

type RpcResult = {
  total_income: number;
  total_expense: number;
  transaction_count: number;
  top_categories: { id: string; name: string; color: string; amount: number; count: number }[] | null;
  peak_day: number | null;
  peak_weekday: number | null;
  daily_expenses: { day: number; amount: number }[] | null;
  max_expense: { amount: number; description: string | null; category_name: string; category_color: string; day: number } | null;
  prev_month_income: number;
  prev_month_expense: number;
  avg3_income: number;
  avg3_expense: number;
  prev_year_income: number | null;
  prev_year_expense: number | null;
  asset_breakdown: { asset_id: string; asset_name: string; asset_type: string; income: number; expense: number; count: number }[] | null;
  recurring_expense: number;
  variable_expense: number;
  recurring_income: number;
  variable_income: number;
  prev_top_categories: { id: string; amount: number }[] | null;
  weekday_expenses: { wd: number; amount: number }[] | null;
  top_transactions: { id: string; amount: number; description: string | null; day: number; category_name: string; category_color: string; asset_name: string }[] | null;
};

// =============================================
// 특정 월 결산 리포트 데이터 조회
// =============================================
export async function getMonthlyReportData(
  year: number,
  month: number
): Promise<ReportData | null> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) return null;

  const userId = authData.claims.sub as string;

  const { data: current } = await supabase.rpc("get_monthly_report_data", {
    p_user_id: userId,
    p_year: year,
    p_month: month,
  });

  if (!current) return null;

  const c = current as RpcResult;
  const me = c.max_expense;

  // 전월 카테고리 지출 맵 (카테고리 비교용)
  const prevCatMap = new Map<string, number>(
    (c.prev_top_categories ?? []).map((p) => [p.id, Number(p.amount)])
  );

  return {
    year,
    month,
    totalIncome: Number(c.total_income),
    totalExpense: Number(c.total_expense),
    transactionCount: Number(c.transaction_count),
    topCategories: (c.top_categories ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      amount: Number(t.amount),
      count: Number(t.count),
      prevAmount: prevCatMap.get(t.id),
    })),
    peakDay: c.peak_day,
    peakWeekday: c.peak_weekday,
    dailyExpenses: (c.daily_expenses ?? []).map((d) => ({
      day: d.day,
      amount: Number(d.amount),
    })),
    maxExpense: me
      ? {
          amount: Number(me.amount),
          description: me.description ?? null,
          categoryName: me.category_name,
          categoryColor: me.category_color,
          day: me.day,
        }
      : null,
    // 비교 지표
    prevMonthIncome: Number(c.prev_month_income),
    prevMonthExpense: Number(c.prev_month_expense),
    avg3Income: Number(c.avg3_income),
    avg3Expense: Number(c.avg3_expense),
    prevYearIncome: c.prev_year_income != null ? Number(c.prev_year_income) : null,
    prevYearExpense: c.prev_year_expense != null ? Number(c.prev_year_expense) : null,
    // 자산별 변동
    assetBreakdown: (c.asset_breakdown ?? []).map((a) => ({
      assetId: a.asset_id,
      assetName: a.asset_name,
      assetType: a.asset_type,
      income: Number(a.income),
      expense: Number(a.expense),
      count: Number(a.count),
    })),
    // 고정비 vs 변동비
    recurringExpense: Number(c.recurring_expense),
    variableExpense: Number(c.variable_expense),
    recurringIncome: Number(c.recurring_income),
    variableIncome: Number(c.variable_income),
    // 요일별 지출
    weekdayExpenses: (c.weekday_expenses ?? []).map((w) => ({
      wd: w.wd,
      amount: Number(w.amount),
    })),
    // Top 5 거래
    topTransactions: (c.top_transactions ?? []).map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      description: t.description ?? null,
      day: t.day,
      categoryName: t.category_name,
      categoryColor: t.category_color,
      assetName: t.asset_name,
    })),
  };
}

// =============================================
// 리포트 목록 조회 (거래 있는 월 최대 12개)
// =============================================
export async function getReportList(): Promise<ReportListItem[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) return [];

  const userId = authData.claims.sub as string;

  const { data: rows, error } = await supabase.rpc("get_report_list", {
    p_user_id: userId,
  });

  if (error || !rows) return [];

  return (rows as { year: number; month: number; total_income: number; total_expense: number }[]).map((r) => ({
    year: r.year,
    month: r.month,
    totalIncome: Number(r.total_income),
    totalExpense: Number(r.total_expense),
  }));
}
