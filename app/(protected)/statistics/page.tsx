// 통계 페이지 - 현재 달 데이터를 await 없이 Promise로 넘겨 셸을 즉시 출력 (RSC 스트리밍)
import { getStatisticsPageData } from "@/lib/actions/transactions";
import { getNowKST } from "@/lib/utils/timezone";
import { StatisticsPageClient } from "@/components/statistics/StatisticsPageClient";

export default function StatisticsPage() {
  // 서버는 UTC로 동작하므로 KST 기준으로 "현재 달"을 계산해야
  // KST 매월 1일 00~09시에 클라이언트와 monthKey가 어긋나지 않는다
  const nowKST = getNowKST();
  const year = nowKST.getUTCFullYear();
  const month = nowKST.getUTCMonth() + 1;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  // 클라이언트는 localStorage 캐시를 먼저 그린 뒤 스트리밍된 결과로 교체한다
  const initialDataPromise = getStatisticsPageData(year, month, 6).catch(() => undefined);

  return <StatisticsPageClient initialDataPromise={initialDataPromise} initialMonthKey={monthKey} />;
}
