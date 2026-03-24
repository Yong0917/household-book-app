// 가계부 페이지 (Suspense로 감싸서 new Date() 허용)
import { Suspense } from "react";
import { LedgerTabView } from "@/components/ledger/LedgerTabView";

export default function DailyPage() {
  return (
    // Suspense boundary: Client Component에서 new Date() 사용을 허용
    <Suspense fallback={null}>
      <LedgerTabView />
    </Suspense>
  );
}
