"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";
import { cancelAccountDeletion, deleteAccount } from "@/lib/actions/account";
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

interface Props {
  email: string;
  scheduledAt: string | null;
}

export function AccountRecoveryClient({ email, scheduledAt }: Props) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPendingRecover, startRecover] = useTransition();
  const [isPendingDelete, startDelete] = useTransition();

  // 삭제 예정일을 한국어 날짜 형식으로 변환
  const formattedDate = scheduledAt
    ? new Date(scheduledAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "30일 후";

  const handleRecover = () => {
    startRecover(async () => {
      await cancelAccountDeletion();
    });
  };

  const handleDelete = () => {
    startDelete(async () => {
      await deleteAccount();
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        {/* 경고 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        {/* 제목 */}
        <h1 className="text-[22px] font-bold text-center tracking-tight mb-2">
          탈퇴 예정 계정입니다
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-1">
          {email}
        </p>
        <p className="text-sm text-muted-foreground text-center mb-8">
          <span className="text-amber-500 font-semibold">{formattedDate}</span>에
          모든 데이터가 영구 삭제됩니다.
        </p>

        {/* 안내 박스 */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 mb-6 text-sm text-muted-foreground space-y-1.5">
          <p>· 지금 복구하면 모든 데이터가 그대로 유지됩니다.</p>
          <p>· 즉시 탈퇴를 선택하면 데이터가 바로 삭제됩니다.</p>
          <p>· 아무것도 선택하지 않으면 예정일에 자동 삭제됩니다.</p>
        </div>

        {/* 복구 버튼 */}
        <button
          onClick={handleRecover}
          disabled={isPendingRecover || isPendingDelete}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] mb-3 disabled:opacity-50 transition-opacity"
        >
          <RotateCcw className="w-4 h-4" />
          {isPendingRecover ? "복구 중..." : "계정 복구하기"}
        </button>

        {/* 즉시 탈퇴 버튼 */}
        <button
          onClick={() => setShowDeleteDialog(true)}
          disabled={isPendingRecover || isPendingDelete}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-destructive/40 text-destructive font-medium text-[15px] disabled:opacity-50 transition-opacity"
        >
          <Trash2 className="w-4 h-4" />
          지금 바로 탈퇴하기
        </button>
      </div>

      {/* 즉시 탈퇴 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 지금 탈퇴하시겠어요?</AlertDialogTitle>
            <AlertDialogDescription>
              모든 거래 내역, 분류, 자산 정보가{" "}
              <strong>즉시 영구 삭제</strong>되며 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPendingDelete}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPendingDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPendingDelete ? "탈퇴 처리 중..." : "즉시 탈퇴"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
