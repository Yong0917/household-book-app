"use client";

// 수입 통계 뷰 컴포넌트 (Mock 데이터 연결)
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, isSameMonth, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { DonutChart } from "@/components/statistics/DonutChart";
import { useMock } from "@/lib/mock/context";

export function IncomeView() {
  // 현재 표시 월 상태 (lazy initializer)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
  const pathname = usePathname();

  // Mock 데이터 읽기
  const { transactions, categories } = useMock();

  // 현재 월 수입 거래 필터링
  const filtered = transactions.filter(
    (t) => t.type === "income" && isSameMonth(parseISO(t.transactionAt), currentMonth)
  );

  // 카테고리별 집계
  const categoryMap = new Map<string, number>();
  filtered.forEach((t) => {
    categoryMap.set(t.categoryId, (categoryMap.get(t.categoryId) ?? 0) + t.amount);
  });

  // DonutChart 데이터 생성 (금액 내림차순 정렬)
  const chartData = Array.from(categoryMap.entries())
    .map(([catId, value]) => {
      const cat = categories.find((c) => c.id === catId);
      return { name: cat?.name ?? "기타", value, color: cat?.color ?? "#6b7280" };
    })
    .sort((a, b) => b.value - a.value);

  // 총 수입
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      {/* 월 이동 헤더 */}
      <header className="sticky top-0 bg-background border-b z-10">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-base font-medium">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </span>

          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 수입/지출 전환 탭 */}
      <div className="flex border-b">
        <Link
          href="/statistics/income"
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            pathname === "/statistics/income"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          수입
        </Link>
        <Link
          href="/statistics/expense"
          className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
            pathname === "/statistics/expense"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          지출
        </Link>
      </div>

      {/* 총 수입 금액 표시 */}
      <div className="text-center py-4">
        <p className="text-3xl font-bold text-blue-500">
          {total.toLocaleString("ko-KR")}원
        </p>
        <p className="text-sm text-muted-foreground mt-1">이번 달 총 수입</p>
      </div>

      {/* 도넛 차트 */}
      <DonutChart data={chartData} total={total} />
    </>
  );
}
