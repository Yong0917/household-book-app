"use client";

// 수입 통계 뷰 컴포넌트 (Mock 데이터 연결)
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, isSameMonth, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DonutChart } from "@/components/statistics/DonutChart";
import { useMock } from "@/lib/mock/context";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

export function IncomeView() {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const pathname = usePathname();

  const openPicker = () => {
    setPickerYear(currentMonth.getFullYear());
    setIsPickerOpen(true);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(pickerYear, monthIndex, 1));
    setIsPickerOpen(false);
  };

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
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/60 z-10">
        <div className="flex items-center justify-center gap-0.5 px-4 h-12">
          <button
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* 월 텍스트 버튼 - 클릭 시 월 선택 팝업 */}
          <button
            onClick={openPicker}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <span className="text-[15px] font-semibold tracking-tight">
              {format(currentMonth, "yyyy년 M월", { locale: ko })}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 수입/지출 전환 탭 */}
      <div className="flex border-b border-border/60">
        <Link
          href="/statistics/income"
          className={cn(
            "flex-1 py-3 text-center text-[13px] font-medium transition-colors relative",
            pathname === "/statistics/income"
              ? "text-income"
              : "text-muted-foreground/60"
          )}
        >
          수입
          {pathname === "/statistics/income" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-income rounded-full" />
          )}
        </Link>
        <Link
          href="/statistics/expense"
          className={cn(
            "flex-1 py-3 text-center text-[13px] font-medium transition-colors relative",
            pathname === "/statistics/expense"
              ? "text-expense"
              : "text-muted-foreground/60"
          )}
        >
          지출
          {pathname === "/statistics/expense" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-expense rounded-full" />
          )}
        </Link>
      </div>

      {/* 총 수입 금액 표시 */}
      <div className="text-center py-6 px-5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-2">이번 달 총 수입</p>
        <p className="text-[2rem] font-bold text-income tabular-nums tracking-tight">
          {total.toLocaleString("ko-KR")}
          <span className="text-2xl font-semibold ml-0.5">원</span>
        </p>
      </div>

      {/* 도넛 차트 */}
      <DonutChart data={chartData} total={total} />

      {/* 월 선택 팝업 */}
      {isPickerOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsPickerOpen(false)} />
          <div className="fixed top-[52px] left-1/2 -translate-x-1/2 z-40 bg-background border border-border/60 rounded-2xl shadow-xl shadow-foreground/8 p-5 w-[21rem]">
            {/* 연도 선택 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setPickerYear((y) => y - 1)}
                className="p-2 rounded-full hover:bg-muted/80 transition-colors"
                aria-label="이전 연도"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[15px] font-semibold tracking-tight">{pickerYear}년</span>
              <button
                onClick={() => setPickerYear((y) => y + 1)}
                className="p-2 rounded-full hover:bg-muted/80 transition-colors"
                aria-label="다음 연도"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 월 그리드 (3×4) */}
            <div className="grid grid-cols-3 gap-2">
              {MONTH_LABELS.map((label, idx) => {
                const isSelected =
                  pickerYear === currentMonth.getFullYear() &&
                  idx === currentMonth.getMonth();
                return (
                  <button
                    key={idx}
                    onClick={() => handleMonthSelect(idx)}
                    className={cn(
                      "py-4 rounded-xl text-[13px] font-medium transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/80 text-foreground active:scale-[0.97]"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
