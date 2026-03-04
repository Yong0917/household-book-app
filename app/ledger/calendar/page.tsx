// 달력 보기 페이지 (LedgerTabView를 통해 접근 권장)
import { Suspense } from "react";
import { LedgerTabView } from "@/components/ledger/LedgerTabView";

export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <LedgerTabView />
    </Suspense>
  );
}
