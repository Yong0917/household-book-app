// 탈퇴 유예기간 중 로그인 시 표시되는 계정 복구 페이지 (서버 컴포넌트)
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountRecoveryClient } from "./AccountRecoveryClient";

export default async function AccountRecoveryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // 탈퇴 예정 계정이 아니면 정상 페이지로
  if (!user.user_metadata?.deletion_requested_at) {
    redirect("/ledger/daily");
  }

  // 탈퇴 요청 테이블에서 예정일 조회
  const { data: deletionRequest } = await supabase
    .from("user_deletion_requests")
    .select("scheduled_deletion_at")
    .eq("user_id", user.id)
    .single();

  const scheduledAt = deletionRequest?.scheduled_deletion_at
    ? new Date(deletionRequest.scheduled_deletion_at)
    : null;

  return (
    <AccountRecoveryClient
      email={user.email ?? ""}
      scheduledAt={scheduledAt?.toISOString() ?? null}
    />
  );
}
