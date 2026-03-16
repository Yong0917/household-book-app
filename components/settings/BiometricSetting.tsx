"use client";

// 생체인증 로그인 설정 토글
import { useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import {
  isBiometricAvailable,
  isBiometricRegistered,
  registerBiometric,
  clearBiometric,
  getBiometricEmail,
} from "@/lib/biometric";

export function BiometricSetting() {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  useEffect(() => {
    isBiometricAvailable().then(setAvailable);
    setEnabled(isBiometricRegistered());
    setRegisteredEmail(getBiometricEmail());
  }, []);

  // 생체인증 미지원 기기는 항목 자체를 숨김
  if (!available) return null;

  const handleToggle = async (checked: boolean) => {
    if (loading) return;
    setLoading(true);

    try {
      if (checked) {
        const supabase = createClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) throw new Error("로그인 상태를 확인할 수 없습니다");

        await registerBiometric(
          session.user.id,
          session.user.email!,
          session.access_token,
          session.refresh_token
        );

        setEnabled(true);
        setRegisteredEmail(session.user.email!);
      } else {
        clearBiometric();
        setEnabled(false);
        setRegisteredEmail(null);
      }
    } catch (err) {
      // 사용자 취소 또는 인증 실패 — 상태 변경 없이 조용히 처리
      console.error("생체인증 설정 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
          <Fingerprint className="h-4 w-4 text-foreground/70" />
        </div>
        <div>
          <span className="text-[14.5px] font-medium">생체인증 로그인</span>
          <p className="text-[12px] text-muted-foreground">
            {enabled && registeredEmail ? registeredEmail : "지문 또는 얼굴인식으로 로그인"}
          </p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={handleToggle} disabled={loading} />
    </div>
  );
}
