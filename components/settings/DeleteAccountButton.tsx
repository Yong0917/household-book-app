"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { requestAccountDeletion } from "@/lib/actions/account";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await requestAccountDeletion();
    });
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 탈퇴하시겠어요?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>탈퇴 요청 후 <strong className="text-foreground">30일간 유예기간</strong>이 주어집니다.</p>
                <p>유예기간 동안 언제든지 로그인해 계정을 복구할 수 있습니다.</p>
                <p>30일이 지나면 모든 데이터가 <strong className="text-destructive">영구적으로 삭제</strong>됩니다.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "처리 중..." : "탈퇴 요청"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3.5 px-4 py-4 text-destructive hover:bg-destructive/5 active:bg-destructive/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Trash2 className="h-4 w-4 text-destructive" />
        </div>
        <span className="text-[14.5px] font-medium">회원탈퇴</span>
      </button>
    </>
  );
}
