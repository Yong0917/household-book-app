"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Transaction, TransactionType } from "@/lib/mock/types";

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
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const start = new Date(Date.UTC(year, month - 1, 1) - KST_OFFSET).toISOString();
  const end = new Date(Date.UTC(year, month, 1) - KST_OFFSET).toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .select("id, type, amount, category_id, asset_id, description, transaction_at")
    .gte("transaction_at", start)
    .lt("transaction_at", end)
    .order("transaction_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toTransaction);
}

// 거래 추가
export async function addTransaction(
  data: Omit<Transaction, "id">
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: data.type,
    amount: data.amount,
    category_id: data.categoryId,
    asset_id: data.assetId,
    description: data.description ?? null,
    transaction_at: data.transactionAt,
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
