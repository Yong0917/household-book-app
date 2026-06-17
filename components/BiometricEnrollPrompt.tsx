"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  isAndroidApp,
  isBiometricAvailable,
  isBiometricLoginEnabled,
  enableBiometricLogin,
} from "@/lib/utils/biometric";

const PROMPTED_KEY = "moneylogs:biometric-prompted";

// 로그인 직후(인증 사용자) 생체인증 등록을 1회 유도한다.
// 로그인 경로가 여러 갈래(이메일/OAuth/Android OAuth)지만 모두 protected layout으로
// 도착하므로 여기서 공통 처리한다. "나중에"를 누르면 다시 뜨지 않고, 설정 토글로 등록 가능.
export default function BiometricEnrollPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAndroidApp() || !isBiometricAvailable()) return;
    if (isBiometricLoginEnabled()) return;
    if (localStorage.getItem(PROMPTED_KEY) === "1") return;
    setOpen(true);
  }, []);

  const handleEnroll = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) return;
      await enableBiometricLogin(session.refresh_token, session.access_token);
    } catch (e) {
      console.error("[BiometricEnrollPrompt]", e);
    }
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // 등록/나중에 무관하게 닫히면 자동 노출 종료 (1회성)
    if (!next) localStorage.setItem(PROMPTED_KEY, "1");
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="생체인증 등록"
      description="다음에 로그인이 풀리면 지문·얼굴 인증으로 빠르게 다시 로그인할 수 있어요."
      confirmLabel="등록"
      cancelLabel="나중에"
      onConfirm={handleEnroll}
    />
  );
}
