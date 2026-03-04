// 수입 통계 페이지 (Suspense로 감싸서 new Date() 허용)
import { Suspense } from "react";
import { IncomeView } from "@/components/statistics/IncomeView";

export default function IncomePage() {
  return (
    // Suspense boundary: Client Component에서 new Date() 사용을 허용
    <Suspense fallback={null}>
      <IncomeView />
    </Suspense>
  );
}
