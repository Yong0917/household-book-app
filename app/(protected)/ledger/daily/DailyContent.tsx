import { format, startOfMonth } from "date-fns";
import { getLedgerMonthData } from "@/lib/actions/transactions";
import { getReceiptAccessStatus } from "@/lib/actions/receiptAccess";
import { LedgerTabView } from "@/components/ledger/LedgerTabView";

export default async function DailyContent() {
  const now = startOfMonth(new Date());
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthKey = format(now, "yyyy-MM");

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
