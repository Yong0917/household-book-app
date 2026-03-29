import { notFound } from "next/navigation";
import { getMonthlyReportData, getReportList } from "@/lib/actions/reports";
import { MonthlyReportClient } from "@/components/statistics/MonthlyReportClient";

interface Props {
  params: Promise<{ year: string; month: string }>;
}

export default async function MonthlyReportPage({ params }: Props) {
  const { year: yearStr, month: monthStr } = await params;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    notFound();
  }

  const [data, reports] = await Promise.all([
    getMonthlyReportData(year, month),
    getReportList(),
  ]);

  // 이전/다음 달 링크 계산 (데이터 있는 달 기준, reports는 내림차순 정렬)
  const currentIdx = reports.findIndex(
    (r) => r.year === year && r.month === month
  );
  const prevReport = currentIdx >= 0 ? (reports[currentIdx + 1] ?? null) : null;
  const nextReport = currentIdx > 0 ? (reports[currentIdx - 1] ?? null) : null;

  const prevLink = prevReport
    ? `/statistics/report/${prevReport.year}/${prevReport.month}`
    : null;
  const nextLink = nextReport
    ? `/statistics/report/${nextReport.year}/${nextReport.month}`
    : null;

  return (
    <MonthlyReportClient
      data={data}
      year={year}
      month={month}
      prevLink={prevLink}
      nextLink={nextLink}
    />
  );
}
