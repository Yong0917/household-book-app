"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { isAndroidApp } from "@/lib/utils/biometric";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    const supabase = createClient();
    // Android: 생체등록을 유지하기 위해 local scope로 로그아웃 (서버 refresh token 보존).
    // 로그인 화면의 생체 버튼 노출과 즉시 재로그인을 위해 저장 토큰을 무효화하지 않는다.
    if (isAndroidApp()) {
      await supabase.auth.signOut({ scope: "local" });
    } else {
      await supabase.auth.signOut();
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
