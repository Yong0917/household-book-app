// 지출 통계 페이지 (Suspense로 감싸서 new Date() 허용)
import { Suspense } from "react";
import { ExpenseView } from "@/components/statistics/ExpenseView";

export default function ExpensePage() {
  return (
    // Suspense boundary: Client Component에서 new Date() 사용을 허용
    <Suspense fallback={null}>
      <ExpenseView />
    </Suspense>
  );
}
