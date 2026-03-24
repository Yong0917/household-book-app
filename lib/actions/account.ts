"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 탈퇴 요청 (30일 유예기간)
export async function requestAccountDeletion(): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");

  // 탈퇴 요청 테이블에 삽입 (Edge Function 크론 잡용)
  const { error: dbError } = await supabase
    .from("user_deletion_requests")
    .upsert({ user_id: user.id });
  if (dbError) throw new Error("탈퇴 요청 처리 중 오류가 발생했습니다.");

  // 유저 메타데이터에 기록 (미들웨어에서 JWT 클레임으로 빠르게 감지)
  await supabase.auth.updateUser({
    data: { deletion_requested_at: new Date().toISOString() },
  });

  await supabase.auth.signOut();
  redirect("/auth/login");
}

// 탈퇴 취소 (유예기간 중 복구)
export async function cancelAccountDeletion(): Promise<void> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");

  // 탈퇴 요청 테이블에서 제거
  await supabase
    .from("user_deletion_requests")
    .delete()
    .eq("user_id", user.id);

  // 유저 메타데이터에서 탈퇴 요청 정보 제거
  await supabase.auth.updateUser({
    data: { deletion_requested_at: null },
  });

  redirect("/ledger/daily");
}

// 즉시 탈퇴 (유예기간 중 즉시 삭제 or 기존 탈퇴)
export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_current_user");
  if (error) throw new Error("회원탈퇴 처리 중 오류가 발생했습니다.");

  await supabase.auth.signOut();
  redirect("/auth/login");
}
