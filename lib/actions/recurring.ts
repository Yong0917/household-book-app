"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RecurringTransaction, TransactionType } from "@/lib/mock/types";

// DB 행 → 앱 타입 변환
function toRecurring(row: {
  id: string;
  type: string;
  amount: number;
  category_id: string;
  asset_id: string;
  description: string | null;
  day_of_month: number;
  is_active: boolean;
}): RecurringTransaction {
  return {
    id: row.id,
    type: row.type as TransactionType,
    amount: row.amount,
    categoryId: row.category_id,
    assetId: row.asset_id,
    description: row.description ?? undefined,
    dayOfMonth: row.day_of_month,
    isActive: row.is_active,
  };
}

// 고정비 전체 목록 조회 (활성 항목만)
export async function getRecurringTransactions(): Promise<RecurringTransaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("id, type, amount, category_id, asset_id, description, day_of_month, is_active")
    .eq("is_active", true)
    .order("day_of_month", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toRecurring);
}

// 고정비 추가
export async function addRecurring(
  data: Omit<RecurringTransaction, "id" | "isActive">
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const { error } = await supabase.from("recurring_transactions").insert({
    user_id: user.id,
    type: data.type,
    amount: data.amount,
    category_id: data.categoryId,
    asset_id: data.assetId,
    description: data.description ?? null,
    day_of_month: data.dayOfMonth,
    is_active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/settings/recurring");
}

// 고정비 수정
export async function updateRecurring(
  id: string,
  data: Partial<Omit<RecurringTransaction, "id">>
): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (data.type !== undefined) updateData.type = data.type;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
  if (data.assetId !== undefined) updateData.asset_id = data.assetId;
  if (data.description !== undefined) updateData.description = data.description ?? null;
  if (data.dayOfMonth !== undefined) updateData.day_of_month = data.dayOfMonth;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("recurring_transactions")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings/recurring");
}

// 고정비 삭제
export async function deleteRecurring(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings/recurring");
}

// 미처리 고정비 조회 (당월: day_of_month <= 오늘, 과거달: 전체, 미래달: 빈 배열)
export async function getUnprocessedRecurring(
  year: number,
  month: number
): Promise<RecurringTransaction[]> {
  const supabase = await createClient();

  // KST 기준 현재 날짜
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const nowKST = new Date(Date.now() + KST_OFFSET);
  const currentYear = nowKST.getUTCFullYear();
  const currentMonth = nowKST.getUTCMonth() + 1;
  const currentDay = nowKST.getUTCDate();

  // 미래 달이면 빈 배열
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return [];
  }

  // 당월이면 day_of_month <= 오늘, 과거달이면 제한 없음
  const isCurrent = year === currentYear && month === currentMonth;
  const maxDay = isCurrent ? currentDay : 31;

  // KST 기준 월 범위 → UTC 변환
  const start = new Date(Date.UTC(year, month - 1, 1) - KST_OFFSET).toISOString();
  const end = new Date(Date.UTC(year, month, 1) - KST_OFFSET).toISOString();

  // 해당 달에 처리된 recurring_id 목록
  const { data: processed } = await supabase
    .from("transactions")
    .select("recurring_id")
    .gte("transaction_at", start)
    .lt("transaction_at", end)
    .not("recurring_id", "is", null);

  // 해당 달에 건너뛴 recurring_id 목록
  const { data: skipped } = await supabase
    .from("recurring_skips")
    .select("recurring_id")
    .eq("year", year)
    .eq("month", month);

  const excludeIds = new Set([
    ...(processed ?? []).map((r) => r.recurring_id as string),
    ...(skipped ?? []).map((s) => s.recurring_id as string),
  ]);

  // 활성 고정비 중 day_of_month 범위 내 + 미처리 + 미건너뜀 항목
  const all = await getRecurringTransactions();
  return all.filter((r) => r.dayOfMonth <= maxDay && !excludeIds.has(r.id));
}

// 고정비 건너뛰기 (해당 달에 등록하지 않음으로 처리)
export async function skipRecurring(
  recurringId: string,
  year: number,
  month: number
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const { error } = await supabase.from("recurring_skips").upsert(
    { user_id: user.id, recurring_id: recurringId, year, month },
    { onConflict: "recurring_id,year,month" }
  );

  if (error) throw new Error(error.message);
}
