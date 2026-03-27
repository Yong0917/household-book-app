// 통계 페이지 - async server component로 현재 달 데이터 SSR 시점 pre-fetch
import { format, startOfMonth } from "date-fns";
import { getStatisticsPageData } from "@/lib/actions/transactions";
import { StatisticsPageClient } from "@/components/statistics/StatisticsPageClient";

export default async function StatisticsPage() {
  const now = startOfMonth(new Date());
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthKey = format(now, "yyyy-MM");

  let initialData;
  try {
    initialData = await getStatisticsPageData(year, month, 6);
  } catch {
    initialData = undefined;
  }

  return <StatisticsPageClient initialData={initialData} initialMonthKey={monthKey} />;
}
