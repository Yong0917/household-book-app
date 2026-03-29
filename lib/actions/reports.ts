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
};

export type DailyExpense = {
  day: number;
  amount: number;
};

export type MaxExpense = {
  amount: number;
  description: string | null;
  categoryName: string;
  categoryColor: string;
  day: number;
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
  prevMonthExpense: number | null; // 전월 지출 (전월 대비 증감 계산용)
  maxExpense: MaxExpense | null;   // 최대 단일 지출
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
  top_categories: TopCategory[] | null;
  peak_day: number | null;
  peak_weekday: number | null;
  daily_expenses: DailyExpense[] | null;
  max_expense: {
    amount: number;
    description: string | null;
    category_name: string;
    category_color: string;
    day: number;
  } | null;
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

  // 해당 월 + 전월 데이터 병렬 조회
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const [{ data: current }, { data: prev }] = await Promise.all([
    supabase.rpc("get_monthly_report_data", {
      p_user_id: userId,
      p_year: year,
      p_month: month,
    }),
    supabase.rpc("get_monthly_report_data", {
      p_user_id: userId,
      p_year: prevYear,
      p_month: prevMonth,
    }),
  ]);

  if (!current) return null;

  const c = current as RpcResult;
  const me = c.max_expense;

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
    })),
    peakDay: c.peak_day,
    peakWeekday: c.peak_weekday,
    dailyExpenses: (c.daily_expenses ?? []).map((d) => ({
      day: d.day,
      amount: Number(d.amount),
    })),
    prevMonthExpense: prev ? Number((prev as RpcResult).total_expense) : null,
    maxExpense: me
      ? {
          amount: Number(me.amount),
          description: me.description ?? null,
          categoryName: me.category_name,
          categoryColor: me.category_color,
          day: me.day,
        }
      : null,
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

  const { data: rows, error: aggErr } = await supabase
    .from("transactions")
    .select("transaction_at, type, amount")
    .eq("user_id", userId)
    .order("transaction_at", { ascending: false });

  if (aggErr || !rows) return [];

  // 월별 집계
  const monthMap = new Map<
    string,
    { year: number; month: number; totalIncome: number; totalExpense: number }
  >();

  for (const row of rows) {
    const kstDate = new Date(
      new Date(row.transaction_at).getTime() + 9 * 60 * 60 * 1000
    );
    const y = kstDate.getUTCFullYear();
    const m = kstDate.getUTCMonth() + 1;
    const key = `${y}-${m}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, { year: y, month: m, totalIncome: 0, totalExpense: 0 });
    }
    const entry = monthMap.get(key)!;
    if (row.type === "income") entry.totalIncome += Number(row.amount);
    else entry.totalExpense += Number(row.amount);
  }

  return Array.from(monthMap.values())
    .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)
    .slice(0, 12);
}
