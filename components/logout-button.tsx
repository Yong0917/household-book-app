"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
