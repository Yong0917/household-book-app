"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Category, TransactionType } from "@/lib/mock/types";

// DB 행 → 앱 타입 변환
function toCategory(row: {
  id: string;
  name: string;
  type: string;
  color: string;
  is_default: boolean;
  sort_order: number;
}): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type as TransactionType,
    color: row.color,
    isDefault: row.is_default,
    sortOrder: row.sort_order,
  };
}

// 카테고리 목록 조회
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, color, is_default, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toCategory);
}

// 카테고리 추가
export async function addCategory(data: Omit<Category, "id" | "sortOrder">): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다");
  const userId = authData.claims.sub as string;

  // 현재 최대 sort_order 조회
  const { data: maxRow } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("user_id", userId)
    .eq("type", data.type)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxRow?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("categories").insert({
    user_id: userId,
    name: data.name,
    type: data.type,
    color: data.color,
    is_default: data.isDefault,
    sort_order: nextOrder,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/settings/categories");
}

// 카테고리 수정
export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id">>
): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.type !== undefined) updateData.type = data.type;

  const { error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings/categories");
}

// 카테고리 순서 일괄 저장
export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("categories").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath("/settings/categories");
}

// 카테고리 삭제
export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/categories");
}
