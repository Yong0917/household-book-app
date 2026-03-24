import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 인증 확인과 탈퇴 상태 확인을 병렬로 실행
  const [{ data }, { data: deletion }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.from("user_deletion_requests").select("user_id").maybeSingle(),
  ]);

  if (!data?.claims) redirect("/auth/login");
  if (deletion) redirect("/auth/account-recovery");

  return <>{children}</>;
}
