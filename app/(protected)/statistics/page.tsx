// 통계 페이지 - async server component로 현재 달 데이터 SSR 시점 pre-fetch
import { getStatisticsPageData } from "@/lib/actions/transactions";
import { getNowKST } from "@/lib/utils/timezone";
import { StatisticsPageClient } from "@/components/statistics/StatisticsPageClient";

export default async function StatisticsPage() {
  // 서버는 UTC로 동작하므로 KST 기준으로 "현재 달"을 계산해야
  // KST 매월 1일 00~09시에 클라이언트와 monthKey가 어긋나지 않는다
  const nowKST = getNowKST();
  const year = nowKST.getUTCFullYear();
  const month = nowKST.getUTCMonth() + 1;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  let initialData;
  try {
    initialData = await getStatisticsPageData(year, month, 6);
  } catch {
    initialData = undefined;
  }

  return <StatisticsPageClient initialData={initialData} initialMonthKey={monthKey} />;
}
