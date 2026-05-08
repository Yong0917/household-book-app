"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Asset, AssetType } from "@/lib/mock/types";

// DB 행 → 앱 타입 변환
function toAsset(row: {
  id: string;
  name: string;
  type: string;
  is_default: boolean;
  sort_order: number;
}): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type as AssetType,
    isDefault: row.is_default,
    sortOrder: row.sort_order,
  };
}

// 자산 목록 조회 (동일 요청 내 중복 호출 dedup)
export const getAssets = cache(async (): Promise<Asset[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("id, name, type, is_default, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toAsset);
});

// 자산 추가 — sort_order 는 BEFORE INSERT 트리거가 자동 할당
export async function addAsset(data: Omit<Asset, "id" | "sortOrder">): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다");
  const userId = authData.claims.sub as string;

  const { error } = await supabase.from("assets").insert({
    user_id: userId,
    name: data.name,
    type: data.type,
    is_default: data.isDefault,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/settings/assets");
}

// 자산 수정
export async function updateAsset(
  id: string,
  data: Partial<Omit<Asset, "id">>
): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;

  const { error } = await supabase
    .from("assets")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings/assets");
}

// 자산 순서 일괄 저장 — RPC 1회 호출로 N개 UPDATE 처리
export async function reorderAssets(orderedIds: string[]): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("reorder_assets", { p_ids: orderedIds });
  if (error) throw new Error(error.message);

  revalidatePath("/settings/assets");
}

// 자산 삭제
export async function deleteAsset(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/assets");
}
