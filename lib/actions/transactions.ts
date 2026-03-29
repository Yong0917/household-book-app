"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Transaction, TransactionType, Category, Asset, RecurringTransaction } from "@/lib/mock/types";
import { getMonthRangeUTC } from "@/lib/utils/timezone";
import { getCategories } from "./categories";
import { getAssets } from "./assets";
import { getUnprocessedRecurring } from "./recurring";

// DB 행 → 앱 타입 변환
function toTransaction(row: {
  id: string;
  type: string;
  amount: number;
  category_id: string;
  asset_id: string;
  description: string | null;
  transaction_at: string;
}): Transaction {
  return {
    id: row.id,
    type: row.type as TransactionType,
    amount: row.amount,
    categoryId: row.category_id,
    assetId: row.asset_id,
    description: row.description ?? undefined,
    transactionAt: row.transaction_at,
  };
}

// 월별 거래 목록 조회
export async function getTransactionsByMonth(
  year: number,
  month: number
): Promise<Transaction[]> {
  const supabase = await createClient();

  // 월의 시작과 끝 (KST 자정 기준 → UTC 변환)
  const { start, end } = getMonthRangeUTC(year, month);

  const { data, error } = await supabase
    .from("transactions")
    .select("id, type, amount, category_id, asset_id, description, transaction_at")
    .gte("transaction_at", start)
    .lt("transaction_at", end)
    .order("transaction_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toTransaction);
}

// 통계 페이지 월별 전체 데이터 단일 조회 (3번 왕복 → 1번으로 최적화)
export async function getStatisticsPageData(year: number, month: number, trendCount: number): Promise<{
  transactions: Transaction[];
  categories: Category[];
  trend: { year: number; month: number; label: string; income: number; expense: number }[];
}> {
  const [transactions, categories, trend] = await Promise.all([
    getTransactionsByMonth(year, month),
    getCategories(),
    getMonthlyTrend(year, month, trendCount),
  ]);
  return { transactions, categories, trend };
}

// 가계부 페이지 월별 전체 데이터 단일 조회 (4번 왕복 → 1번으로 최적화)
export async function getLedgerMonthData(year: number, month: number): Promise<{
  transactions: Transaction[];
  categories: Category[];
  assets: Asset[];
  recurring: RecurringTransaction[];
}> {
  const [transactions, categories, assets, recurring] = await Promise.all([
    getTransactionsByMonth(year, month),
    getCategories(),
    getAssets(),
    getUnprocessedRecurring(year, month),
  ]);
  return { transactions, categories, assets, recurring };
}

// 거래 추가
export async function addTransaction(
  data: Omit<Transaction, "id"> & { recurringId?: string }
): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다");

  const { error } = await supabase.from("transactions").insert({
    user_id: authData.claims.sub as string,
    type: data.type,
    amount: data.amount,
    category_id: data.categoryId,
    asset_id: data.assetId,
    description: data.description ?? null,
    transaction_at: data.transactionAt,
    recurring_id: data.recurringId ?? null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/ledger");
  revalidatePath("/statistics");
}

// 거래 수정
export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, "id">>
): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (data.type !== undefined) updateData.type = data.type;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
  if (data.assetId !== undefined) updateData.asset_id = data.assetId;
  if (data.description !== undefined) updateData.description = data.description ?? null;
  if (data.transactionAt !== undefined) updateData.transaction_at = data.transactionAt;

  const { error } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/ledger");
  revalidatePath("/statistics");
}

// 거래 검색 (키워드 + 필터)
export async function searchTransactions(params: {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  assetIds?: string[];
  categoryIds?: string[];
  minAmount?: number;
  maxAmount?: number;
}): Promise<Transaction[]> {
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select("id, type, amount, category_id, asset_id, description, transaction_at")
    .order("transaction_at", { ascending: false })
    .limit(200);

  if (params.keyword) {
    query = query.ilike("description", `%${params.keyword}%`);
  }
  if (params.startDate) {
    query = query.gte("transaction_at", new Date(params.startDate).toISOString());
  }
  if (params.endDate) {
    const end = new Date(params.endDate);
    end.setDate(end.getDate() + 1);
    query = query.lt("transaction_at", end.toISOString());
  }
  if (params.assetIds?.length) {
    query = query.in("asset_id", params.assetIds);
  }
  if (params.categoryIds?.length) {
    query = query.in("category_id", params.categoryIds);
  }
  if (params.minAmount !== undefined) {
    query = query.gte("amount", params.minAmount);
  }
  if (params.maxAmount !== undefined) {
    query = query.lte("amount", params.maxAmount);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(toTransaction);
}

// 거래 삭제
export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ledger");
  revalidatePath("/statistics");
}

// 월별 추이 데이터 조회 (최근 N개월) — DB GROUP BY RPC 사용
export async function getMonthlyTrend(
  baseYear: number,
  baseMonth: number,
  count: number = 6
): Promise<{ year: number; month: number; label: string; income: number; expense: number }[]> {
  const supabase = await createClient();

  const base = new Date(baseYear, baseMonth - 1, 1);
  const startDate = new Date(base.getFullYear(), base.getMonth() - (count - 1), 1);

  const start = getMonthRangeUTC(startDate.getFullYear(), startDate.getMonth() + 1).start;
  const end = getMonthRangeUTC(baseYear, baseMonth).end;

  const { data, error } = await supabase.rpc("get_monthly_trend", {
    p_start: start,
    p_end: end,
  });

  if (error) throw new Error(error.message);

  // 빈 달(거래 없음)도 포함하도록 전체 달 목록으로 머지
  type Entry = { year: number; month: number; income: number; expense: number };
  const monthMap = new Map<string, Entry>();

  for (let i = 0; i < count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - (count - 1 - i), 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    monthMap.set(`${y}-${String(m).padStart(2, "0")}`, { year: y, month: m, income: 0, expense: 0 });
  }

  for (const row of data ?? []) {
    const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
    const entry = monthMap.get(key);
    if (entry) {
      entry.income = Number(row.income);
      entry.expense = Number(row.expense);
    }
  }

  return Array.from(monthMap.values()).map((e) => ({
    ...e,
    label: `${e.month}월`,
  }));
}

// 메모 자동완성 추천 목록 조회
export async function getMemoSuggestions(keyword: string): Promise<string[]> {
  if (!keyword.trim()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("description")
    .ilike("description", `%${keyword}%`)
    .not("description", "is", null)
    .limit(10);
  if (error) return [];
  const unique = [...new Set((data ?? []).map((r) => r.description as string))];
  return unique;
}
