import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { GuestModeProvider } from "@/lib/context/GuestModeContext";
import DeletionGuard from "@/components/DeletionGuard";
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

  return (
    <GuestModeProvider isGuest={isGuest}>
      {/* 인증된 사용자만 탈퇴 상태 확인 — DB 왕복이 셸 출력을 막지 않도록 Suspense로 분리 */}
      {!isGuest && (
        <Suspense fallback={null}>
          <DeletionGuard />
        </Suspense>
      )}
      {!isGuest && <PushNotificationInit />}
      {!isGuest && <BiometricTokenSync />}
      {!isGuest && <BiometricEnrollPrompt />}
      {isGuest && <BiometricReloginGate />}
      {children}
    </GuestModeProvider>
  );
}
