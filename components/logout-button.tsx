"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { isAndroidApp, clearBiometricLogin } from "@/lib/utils/biometric";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // 명시적 로그아웃 = 생체등록 해제 (세션 자동 만료와 구분).
    // 다음 로그인 시 등록을 다시 유도하도록 관련 플래그도 초기화.
    if (isAndroidApp()) {
      clearBiometricLogin();
      try {
        localStorage.removeItem("moneylogs:biometric-prompted");
        sessionStorage.removeItem("moneylogs:bio-relogin-attempted");
      } catch {
        // no-op
      }
    }
    router.push("/auth/login");
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="로그아웃"
        description="정말 로그아웃하시겠어요?"
        confirmLabel="로그아웃"
        onConfirm={logout}
      />
      <button onClick={() => setOpen(true)} className={className}>
        {children ?? "로그아웃"}
      </button>
    </>
  );
}
