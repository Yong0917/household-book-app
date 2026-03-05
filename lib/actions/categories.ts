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
}): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type as TransactionType,
    color: row.color,
    isDefault: row.is_default,
  };
}

// 카테고리 목록 조회
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, color, is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toCategory);
}

// 카테고리 추가
export async function addCategory(data: Omit<Category, "id">): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: data.name,
    type: data.type,
    color: data.color,
    is_default: data.isDefault,
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

// 카테고리 삭제 (기본 카테고리는 삭제 불가)
export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();

  // 기본 카테고리 여부 확인
  const { data: cat } = await supabase
    .from("categories")
    .select("is_default")
    .eq("id", id)
    .single();

  if (cat?.is_default) return;

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/categories");
}
