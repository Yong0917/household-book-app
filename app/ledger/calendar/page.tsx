// 달력 보기 페이지 (Suspense로 감싸서 new Date() 허용)
import { Suspense } from "react";
import { CalendarView } from "@/components/ledger/CalendarView";

export default function CalendarPage() {
  return (
    // Suspense boundary: Client Component에서 new Date() 사용을 허용
    <Suspense fallback={null}>
      <CalendarView />
    </Suspense>
  );
}
