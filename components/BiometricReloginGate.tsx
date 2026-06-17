"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  isAndroidApp,
  isBiometricLoginEnabled,
  biometricLogin,
  clearBiometricLogin,
} from "@/lib/utils/biometric";

const ATTEMPT_KEY = "moneylogs:bio-relogin-attempted";

// 세션 만료로 게스트 모드에 진입했을 때, 생체로그인이 등록돼 있으면 자동으로
// 생체 재로그인을 시도한다. Android 앱은 부팅 시 /ledger/daily로 직접 진입하므로
// 로그인 화면(/auth/login)을 거치지 않아 이 게이트가 진입점 역할을 한다.
// protected layout에서 isGuest일 때만 마운트된다.
export default function BiometricReloginGate() {
  const router = useRouter();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!isAndroidApp() || !isBiometricLoginEnabled()) return;
    // 세션당 1회만 자동 시도 — 반복 프롬프트·게스트 체험 방해 방지
    if (sessionStorage.getItem(ATTEMPT_KEY) === "1") return;
    sessionStorage.setItem(ATTEMPT_KEY, "1");

    setActive(true);
    (async () => {
      const tokens = await biometricLogin();
      if (!tokens) {
        // 취소/실패 → 게스트 모드 유지
        setActive(false);
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      if (error) {
        // 저장 토큰 만료/무효 → 등록 해제 후 게스트 유지
        clearBiometricLogin();
        setActive(false);
        return;
      }
      // 인증 상태로 RSC 재진입 (getClaims 통과 → isGuest=false)
      router.refresh();
    })();
  }, [router]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon-512.png"
        alt="머니로그"
        className="w-16 h-16 rounded-2xl select-none"
        draggable={false}
      />
      <p className="text-[13.5px] text-muted-foreground">생체인증으로 로그인 중...</p>
    </div>
  );
}
