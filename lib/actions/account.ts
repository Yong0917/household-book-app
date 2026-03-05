"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 현재 유저의 모든 데이터와 계정을 삭제
export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_current_user");
  if (error) throw new Error("회원탈퇴 처리 중 오류가 발생했습니다.");

  await supabase.auth.signOut();
  redirect("/auth/login");
}
