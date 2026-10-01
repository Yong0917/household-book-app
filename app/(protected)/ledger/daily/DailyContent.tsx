import { getLedgerMonthData } from "@/lib/actions/transactions";
import { getReceiptAccessStatus } from "@/lib/actions/receiptAccess";
import { getNowKST } from "@/lib/utils/timezone";
import { LedgerTabView } from "@/components/ledger/LedgerTabView";

export default function DailyContent() {
  // 서버는 UTC로 동작하므로 KST 기준으로 "현재 달"을 계산해야
  // KST 매월 1일 00~09시에 클라이언트와 monthKey가 어긋나지 않는다
  const nowKST = getNowKST();
  const year = nowKST.getUTCFullYear();
  const month = nowKST.getUTCMonth() + 1;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  // await 하지 않고 Promise 그대로 넘긴다 → 셸 HTML을 DB 조회 전에 즉시 내보내고,
  // 클라이언트는 localStorage 캐시를 먼저 그린 뒤 스트리밍된 결과로 교체한다
  const initialDataPromise = getLedgerMonthData(year, month).catch(() => undefined);
  const receiptAccessStatusPromise = getReceiptAccessStatus().catch(() => "none" as const);

  return (
    <LedgerTabView
      initialDataPromise={initialDataPromise}
      initialMonthKey={monthKey}
      receiptAccessStatusPromise={receiptAccessStatusPromise}
    />
  );
}
