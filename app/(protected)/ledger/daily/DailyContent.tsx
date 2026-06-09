import { getLedgerMonthData } from "@/lib/actions/transactions";
import { getReceiptAccessStatus } from "@/lib/actions/receiptAccess";
import { getNowKST } from "@/lib/utils/timezone";
import { LedgerTabView } from "@/components/ledger/LedgerTabView";

export default async function DailyContent() {
  // 서버는 UTC로 동작하므로 KST 기준으로 "현재 달"을 계산해야
  // KST 매월 1일 00~09시에 클라이언트와 monthKey가 어긋나지 않는다
  const nowKST = getNowKST();
  const year = nowKST.getUTCFullYear();
  const month = nowKST.getUTCMonth() + 1;
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  const [initialData, receiptAccessStatus] = await Promise.all([
    getLedgerMonthData(year, month).catch(() => undefined),
    getReceiptAccessStatus().catch(() => "none" as const),
  ]);

  return (
    <LedgerTabView
      initialData={initialData}
      initialMonthKey={monthKey}
      receiptAccessStatus={receiptAccessStatus}
    />
  );
}
