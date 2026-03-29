import { notFound } from "next/navigation";
import { getMonthlyReportData } from "@/lib/actions/reports";
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

  const data = await getMonthlyReportData(year, month);

  return <MonthlyReportClient data={data} year={year} month={month} />;
}
