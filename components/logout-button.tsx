"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { isAndroidApp, isBiometricLoginEnabled } from "@/lib/utils/biometric";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

// @supabase/ssr 브라우저 클라이언트가 쿠키에 저장한 세션을 서버 폐기 없이 비운다.
// signOut()은 scope와 무관하게 /logout을 호출해 refresh token을 서버에서 폐기하므로,
// 생체로그인 사용자는 그 대신 이 함수로 로컬 쿠키만 지워 저장된 토큰을 살려둔다.
function clearLocalAuthCookies() {
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0].trim();
    if (name.startsWith("sb-") && name.includes("-auth-token")) {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    }
  }
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    // Android + 생체로그인 등록: 서버 세션을 폐기하면 네이티브에 저장된 refresh token도
    // 무효화되어 지문 재로그인이 불가능해진다. 로컬 세션(쿠키)만 비우고 서버 토큰은 보존한다.
    // (생체로그인을 끄면 네이티브 저장 토큰이 삭제되므로 이후 로그아웃은 일반 폐기로 동작)
    if (isAndroidApp() && isBiometricLoginEnabled()) {
      clearLocalAuthCookies();
    } else {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/auth/login");
    router.refresh();
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
