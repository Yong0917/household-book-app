"use client";

import { useState, useTransition } from "react";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { getAccessRequests, reviewAccessRequest } from "@/lib/actions/receiptAccess";
import type { AccessRequest } from "@/lib/actions/receiptAccess";

interface Props {
  initialRequests: AccessRequest[];
}

const statusLabel: Record<string, { label: string; className: string }> = {
  pending: { label: "대기 중", className: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  approved: { label: "승인됨", className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
  denied: { label: "거부됨", className: "text-rose-600 bg-rose-50 dark:bg-rose-950/40" },
};

export function ReceiptAccessAdmin({ initialRequests }: Props) {
  const [requests, setRequests] = useState<AccessRequest[]>(initialRequests);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const updated = await getAccessRequests();
      setRequests(updated);
    });
  };

  const handleReview = (id: string, action: "approved" | "denied") => {
    startTransition(async () => {
      await reviewAccessRequest(id, action);
      const updated = await getAccessRequests();
      setRequests(updated);
    });
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="mt-5 px-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[10px] font-bold text-muted-foreground/55 uppercase tracking-[0.14em]">
          영수증 스캔 접근 관리
        </p>
        {pendingCount > 0 && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
            {pendingCount}건 대기
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground/50">
            <Users className="h-5 w-5" />
            <p className="text-[13px]">접근 요청이 없습니다</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {requests.map((req) => (
              <li key={req.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium truncate">{req.email}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(req.requested_at).toLocaleDateString("ko-KR", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusLabel[req.status].className}`}>
                      {statusLabel[req.status].label}
                    </span>
                  </div>
                </div>

                {/* 대기 중인 요청만 승인/거부 버튼 표시 */}
                {req.status === "pending" && (
                  <div className="flex gap-2 mt-2.5">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReview(req.id, "approved")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12.5px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      승인
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReview(req.id, "denied")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12.5px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      거부
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* 새로고침 */}
        <button
          type="button"
          onClick={refresh}
          disabled={isPending}
          className="w-full py-3 text-[12.5px] text-muted-foreground hover:bg-muted/40 transition-colors border-t border-border/50 disabled:opacity-50"
        >
          {isPending ? "불러오는 중..." : "새로고침"}
        </button>
      </div>
    </div>
  );
}


// 대기 상태 표시용 (일반 유저)
export function ReceiptAccessStatus({ status }: { status: "pending" | "denied" | "none" }) {
  if (status === "pending") {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
        <Clock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
        <p className="text-[12px] text-amber-700 dark:text-amber-400">
          승인 요청이 접수됐어요. 관리자 승인 후 사용 가능해요.
        </p>
      </div>
    );
  }
  if (status === "denied") {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40">
        <XCircle className="h-3.5 w-3.5 text-rose-600 flex-shrink-0" />
        <p className="text-[12px] text-rose-700 dark:text-rose-400">
          접근이 거부됐습니다. 관리자에게 문의하세요.
        </p>
      </div>
    );
  }
  return null;
}
