import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 탈퇴 요청 상태 확인 — Suspense 안에서 렌더해 페이지 셸 출력을 막지 않는다.
// 스트리밍 중 redirect()는 클라이언트 측 리다이렉트로 처리된다.
export default async function DeletionGuard() {
  const supabase = await createClient();
  const { data: deletion } = await supabase
    .from("user_deletion_requests")
    .select("user_id")
    .maybeSingle();
  if (deletion) redirect("/auth/account-recovery");
  return null;
}
