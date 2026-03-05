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
import { deleteAccount } from "@/lib/actions/account";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await deleteAccount();
    });
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 탈퇴하시겠어요?</AlertDialogTitle>
            <AlertDialogDescription>
              탈퇴하면 모든 거래 내역, 분류, 자산 정보가 <strong>영구적으로 삭제</strong>되며 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "탈퇴 처리 중..." : "회원탈퇴"}
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
