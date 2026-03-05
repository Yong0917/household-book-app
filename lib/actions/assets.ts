"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Asset, AssetType } from "@/lib/mock/types";

// DB 행 → 앱 타입 변환
function toAsset(row: {
  id: string;
  name: string;
  type: string;
  is_default: boolean;
}): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type as AssetType,
    isDefault: row.is_default,
  };
}

// 자산 목록 조회
export async function getAssets(): Promise<Asset[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("id, name, type, is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toAsset);
}

// 자산 추가
export async function addAsset(data: Omit<Asset, "id">): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const { error } = await supabase.from("assets").insert({
    user_id: user.id,
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

// 자산 삭제 (기본 자산은 삭제 불가)
export async function deleteAsset(id: string): Promise<void> {
  const supabase = await createClient();

  const { data: asset } = await supabase
    .from("assets")
    .select("is_default")
    .eq("id", id)
    .single();

  if (asset?.is_default) return;

  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings/assets");
}
