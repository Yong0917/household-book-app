"use client";

import { useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  isAndroidApp,
  isBiometricAvailable,
  isBiometricLoginEnabled,
  enableBiometricLogin,
  clearBiometricLogin,
} from "@/lib/utils/biometric";

export function BiometricLoginToggle() {
  const [show, setShow] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAndroidApp() || !isBiometricAvailable()) return;
    setShow(true);
    setEnabled(isBiometricLoginEnabled());
  }, []);

  if (!show) return null;

  async function handleToggle() {
    if (loading) return;
    setLoading(true);
    try {
      if (!enabled) {
        // 등록: 현재 세션 토큰을 생체인증으로 잠금
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (!session) {
          setLoading(false);
          return;
        }
        const ok = await enableBiometricLogin(session.refresh_token, session.access_token);
        setEnabled(ok);
      } else {
        clearBiometricLogin();
        setEnabled(false);
      }
    } catch (e) {
      console.error("[BiometricLoginToggle]", e);
      setEnabled(isBiometricLoginEnabled());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-t border-border/50">
      {/* 아이콘 + 텍스트 영역 */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
          <Fingerprint className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[14.5px] font-medium leading-tight">생체인증 로그인</span>
          <span className="text-[12px] text-muted-foreground/60 leading-tight">
            지문·얼굴로 빠르게 로그인
          </span>
        </div>
      </div>
      {/* 토글 스위치 */}
      <button
        role="switch"
        aria-checked={enabled}
        aria-label="생체인증 로그인 켜기/끄기"
        onClick={handleToggle}
        disabled={loading}
        className={[
          "relative inline-flex h-[30px] w-[52px] shrink-0 items-center rounded-full",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          enabled ? "bg-emerald-500" : "bg-muted-foreground/25",
        ].join(" ")}
      >
        {/* 토글 핸들 */}
        <span
          className={[
            "inline-block h-[22px] w-[22px] rounded-full bg-white",
            "shadow-[0_1px_4px_rgba(0,0,0,0.18)]",
            "transition-transform duration-200",
            enabled ? "translate-x-[26px]" : "translate-x-[4px]",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
