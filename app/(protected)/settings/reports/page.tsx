import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getReportList } from "@/lib/actions/reports";

export default async function ReportsPage() {
  const reports = await getReportList();

  return (
    <>
      {/* 헤더 */}
      <header className="border-b border-border/40" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="h-14 flex items-center gap-2 px-4">
          <Link
            href="/settings"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-muted/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight">월별 리포트</h1>
        </div>
      </header>

      <div className="px-4 mt-5 pb-24">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
            <p className="text-sm">아직 결산 데이터가 없어요</p>
            <Link
              href="/ledger/daily"
              className="text-xs text-primary underline underline-offset-2"
            >
              거래를 기록하러 가기
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
            {reports.map((item) => (
              <Link
                key={`${item.year}-${item.month}`}
                href={`/statistics/report/${item.year}/${item.month}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14.5px] font-semibold">
                    {item.year}년 {item.month}월
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-income">
                      수입 {item.totalIncome.toLocaleString("ko-KR")}원
                    </span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-expense">
                      지출 {item.totalExpense.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
