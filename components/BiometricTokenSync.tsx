"use client";

import { useEffect } from "react";
import { scheduleIdle } from "@/lib/utils/idle";
import { isAndroidApp, isBiometricLoginEnabled, updateBiometricTokens } from "@/lib/utils/biometric";

// 생체로그인이 등록된 경우, Supabase 세션이 갱신될 때마다(refresh token rotation)
// 저장된 토큰을 최신값으로 동기화한다. 이것이 없으면 등록 시점의 refresh token이
// rotation으로 무효화되어 다음 생체로그인이 실패한다.
// protected layout에서 인증 사용자에게만 마운트된다.
// 생체로그인은 Android 앱 전용이므로 그 외 환경에서는 Supabase SDK를 아예 로드하지 않고,
// Android에서도 첫 화면 하이드레이션을 막지 않도록 유휴 시점에 지연 로드한다.
export default function BiometricTokenSync() {
  useEffect(() => {
    if (!isAndroidApp()) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const start = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      if (cancelled) return;
      const supabase = createClient();
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event !== "TOKEN_REFRESHED" && event !== "SIGNED_IN") return;
        if (!session) return;
        if (!isBiometricLoginEnabled()) return;
        updateBiometricTokens(session.refresh_token, session.access_token);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    };

    const cancelSchedule = scheduleIdle(() => void start());

    return () => {
      cancelled = true;
      cancelSchedule();
      unsubscribe?.();
    };
  }, []);

  return null;
}
