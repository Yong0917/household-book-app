// 가계부 페이지 - async server component로 현재 달 데이터 SSR 시점 pre-fetch
import { Suspense } from "react";
import { format, startOfMonth } from "date-fns";
import { getLedgerMonthData } from "@/lib/actions/transactions";
import { LedgerTabView } from "@/components/ledger/LedgerTabView";

export default async function DailyPage() {
  // 서버에서 현재 달 데이터를 미리 가져와 클라이언트에 전달
  // → 클라이언트 hydration 즉시 데이터 표시 (로딩 스피너 없음)
  const now = startOfMonth(new Date());
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthKey = format(now, "yyyy-MM");

  let initialData;
  try {
    initialData = await getLedgerMonthData(year, month);
  } catch {
    // fetch 실패 시 클라이언트 fetch로 폴백
    initialData = undefined;
  }

  return (
    <Suspense fallback={null}>
      <LedgerTabView initialData={initialData} initialMonthKey={monthKey} />
    </Suspense>
  );
}
