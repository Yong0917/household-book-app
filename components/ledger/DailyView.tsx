"use client";

// 가계부 월간 목록 뷰 (날짜별 그룹화)
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  isSameMonth,
  parseISO,
  startOfMonth,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { TransactionList } from "@/components/ledger/TransactionList";
import { TransactionSheet } from "@/components/ledger/TransactionSheet";
import { useMock } from "@/lib/mock/context";
import type { Transaction } from "@/lib/mock/types";

export function DailyView() {
  // 현재 표시 중인 월 (lazy initializer)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
  // 바텀 시트 열림 상태
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // 수정 중인 거래 (null이면 create 모드)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Mock 데이터 읽기
  const { transactions, categories, assets } = useMock();

  // 현재 월 거래 필터링
  const filtered = transactions.filter((t) =>
    isSameMonth(parseISO(t.transactionAt), currentMonth)
  );

  // 월간 수입/지출/순합계 계산
  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = filtered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const net = income - expense;

  // 날짜별 그룹화 (내림차순 정렬)
  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = format(parseISO(t.transactionAt), "yyyy-MM-dd");
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort().reverse();

  // 거래 항목 클릭 → 수정 시트 열기
  const handleItemClick = (id: string) => {
    const tx = transactions.find((t) => t.id === id) ?? null;
    setSelectedTransaction(tx);
    setIsSheetOpen(true);
  };

  // FAB 클릭 → 추가 시트 열기
  const handleAddClick = () => {
    setSelectedTransaction(null);
    setIsSheetOpen(true);
  };

  // FAB의 기본 날짜: 현재 월이면 오늘, 아니면 해당 월 1일
  const defaultDate = isSameMonth(new Date(), currentMonth)
    ? format(new Date(), "yyyy-MM-dd")
    : format(currentMonth, "yyyy-MM-dd");

  return (
    <>
      {/* 상단 월 네비게이션 헤더 */}
      <header className="sticky top-12 bg-background border-b z-10">
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

      {/* 월간 수입/지출/순합계 요약 */}
      <div className="px-4 py-3 bg-muted/30 border-b">
        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">수입</p>
            <p className="text-sm font-medium text-blue-500">
              {income.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">지출</p>
            <p className="text-sm font-medium text-red-500">
              {expense.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">순합계</p>
            <p
              className={`text-sm font-medium ${
                net >= 0 ? "text-blue-500" : "text-red-500"
              }`}
            >
              {net >= 0 ? "+" : ""}
              {net.toLocaleString("ko-KR")}원
            </p>
          </div>
        </div>
      </div>

      {/* 날짜별 그룹화된 거래 목록 */}
      {sortedDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground text-sm">거래 내역이 없습니다</p>
        </div>
      ) : (
        sortedDates.map((dateKey) => {
          const dayTransactions = grouped[dateKey];
          const dayDate = parseISO(dateKey);

          // 해당 일자 수입/지출 소계
          const dayIncome = dayTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);
          const dayExpense = dayTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

          // TransactionList에 전달할 데이터 변환
          const listItems = dayTransactions.map((t) => ({
            id: t.id,
            type: t.type,
            categoryName: categories.find((c) => c.id === t.categoryId)?.name ?? "기타",
            description: t.description,
            assetName: assets.find((a) => a.id === t.assetId)?.name ?? "기타",
            amount: t.amount,
          }));

          return (
            <div key={dateKey}>
              {/* 날짜 구분 헤더 */}
              <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-t">
                <span className="text-sm font-medium">
                  {format(dayDate, "M월 d일 (E)", { locale: ko })}
                  {isToday(dayDate) && (
                    <span className="ml-1.5 text-xs text-primary font-normal">오늘</span>
                  )}
                </span>
                <div className="flex gap-3 text-xs">
                  {dayIncome > 0 && (
                    <span className="text-blue-500">
                      +{dayIncome.toLocaleString("ko-KR")}
                    </span>
                  )}
                  {dayExpense > 0 && (
                    <span className="text-red-500">
                      -{dayExpense.toLocaleString("ko-KR")}
                    </span>
                  )}
                </div>
              </div>

              {/* 해당 날짜의 거래 목록 */}
              <TransactionList transactions={listItems} onItemClick={handleItemClick} />
            </div>
          );
        })
      )}

      {/* 거래 추가 FAB 버튼 */}
      <button
        onClick={handleAddClick}
        className="fixed bottom-20 right-4 z-10 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="거래 추가"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* 거래 등록/수정 바텀 시트 */}
      <TransactionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        mode={selectedTransaction ? "edit" : "create"}
        transaction={selectedTransaction ?? undefined}
        initialDate={defaultDate}
      />
    </>
  );
}
