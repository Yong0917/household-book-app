import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");

  // 탈퇴 예정 계정이면 복구 페이지로 이동
  const { data: deletion } = await supabase
    .from("user_deletion_requests")
    .select("user_id")
    .maybeSingle();
  if (deletion) redirect("/auth/account-recovery");

  return <>{children}</>;
}
