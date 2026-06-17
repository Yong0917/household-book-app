"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { isBiometricLoginEnabled, updateBiometricTokens } from "@/lib/utils/biometric";

// 생체로그인이 등록된 경우, Supabase 세션이 갱신될 때마다(refresh token rotation)
// 저장된 토큰을 최신값으로 동기화한다. 이것이 없으면 등록 시점의 refresh token이
// rotation으로 무효화되어 다음 생체로그인이 실패한다.
// protected layout에서 인증 사용자에게만 마운트된다.
export default function BiometricTokenSync() {
  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "TOKEN_REFRESHED" && event !== "SIGNED_IN") return;
      if (!session) return;
      if (!isBiometricLoginEnabled()) return;
      updateBiometricTokens(session.refresh_token, session.access_token);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
