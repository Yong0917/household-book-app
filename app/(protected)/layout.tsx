import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuestModeProvider } from "@/lib/context/GuestModeContext";
import PushNotificationInit from "@/components/PushNotificationInit";
import BiometricReloginGate from "@/components/BiometricReloginGate";
import BiometricEnrollPrompt from "@/components/BiometricEnrollPrompt";
import BiometricTokenSync from "@/components/BiometricTokenSync";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isGuest = !data?.claims;

  // 인증된 사용자만 탈퇴 상태 확인
  if (!isGuest) {
    const { data: deletion } = await supabase
      .from("user_deletion_requests")
      .select("user_id")
      .maybeSingle();
    if (deletion) redirect("/auth/account-recovery");
  }

  return (
    <GuestModeProvider isGuest={isGuest}>
      {!isGuest && <PushNotificationInit />}
      {!isGuest && <BiometricTokenSync />}
      {!isGuest && <BiometricEnrollPrompt />}
      {isGuest && <BiometricReloginGate />}
      {children}
    </GuestModeProvider>
  );
}
