"use client";

// 달력 보기 컴포넌트 - Supabase 연동
import { useState, useEffect, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { TransactionList } from "./TransactionList";
import { TransactionSheet } from "./TransactionSheet";
import { getTransactionsByMonth } from "@/lib/actions/transactions";
import { getCategories } from "@/lib/actions/categories";
import { getAssets } from "@/lib/actions/assets";
import type { Transaction, Category, Asset } from "@/lib/mock/types";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

// 달력 외 고정 영역 높이 합계 (px)
// 월헤더(48) + LedgerTabView 탭바(48) + 요약바(40) + 요일헤더(32) + 하단탭바(64)
const NON_CALENDAR_PX = 232;

interface CalendarViewProps {
  currentMonth: Date;
}

export function CalendarView({ currentMonth }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
  const [isTransactionSheetOpen, setIsTransactionSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // 서버에서 가져온 데이터
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // 데이터 로드
  const loadData = useCallback(async () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const [txs, cats, assts] = await Promise.all([
      getTransactionsByMonth(year, month),
      getCategories(),
      getAssets(),
    ]);
    setTransactions(txs);
    setCategories(cats);
    setAssets(assts);
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 현재 월 거래 필터링
  const monthlyTransactions = transactions.filter((t) =>
    isSameMonth(parseISO(t.transactionAt), currentMonth)
  );

  // 월간 수입/지출 집계
  const monthIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const monthNet = monthIncome - monthExpense;

  // 날짜별 수입/지출 집계 Map
  const dayMap = new Map<string, { income: number; expense: number }>();
  monthlyTransactions.forEach((t) => {
    const key = format(parseISO(t.transactionAt), "yyyy-MM-dd");
    const prev = dayMap.get(key) ?? { income: 0, expense: 0 };
    if (t.type === "income") {
      dayMap.set(key, { ...prev, income: prev.income + t.amount });
    } else {
      dayMap.set(key, { ...prev, expense: prev.expense + t.amount });
    }
  });

  // 달력 날짜 배열 및 행 수 계산
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const startOffset = getDay(days[0]);
  const rows = Math.ceil((startOffset + days.length) / 7);

  // 날짜 클릭 → 날짜 바텀시트 열기
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDaySheetOpen(true);
  };

  // 거래 클릭 → 날짜 시트 닫고 수정 시트 열기
  const handleTransactionClick = (id: string) => {
    const tx = transactions.find((t) => t.id === id) ?? null;
    setSelectedTransaction(tx);
    setIsDaySheetOpen(false);
    setTimeout(() => setIsTransactionSheetOpen(true), 300);
  };

  // 날짜 시트에서 "이 날 거래 추가" 클릭
  const handleDaySheetAdd = () => {
    setSelectedTransaction(null);
    setIsDaySheetOpen(false);
    setTimeout(() => setIsTransactionSheetOpen(true), 300);
  };

  // FAB 클릭 → 거래 추가 시트 열기
  const handleFabClick = () => {
    setSelectedTransaction(null);
    setIsTransactionSheetOpen(true);
  };

  // 선택한 날짜의 거래 목록
  const selectedDayTransactions = selectedDate
    ? transactions
        .filter((t) => isSameDay(parseISO(t.transactionAt), selectedDate))
        .sort((a, b) => b.transactionAt.localeCompare(a.transactionAt))
    : [];

  const selectedDayItems = selectedDayTransactions.map((t) => {
    const cat = categories.find((c) => c.id === t.categoryId);
    return {
      id: t.id,
      type: t.type,
      categoryName: cat?.name ?? "기타",
      categoryColor: cat?.color,
      description: t.description,
      assetName: assets.find((a) => a.id === t.assetId)?.name ?? "기타",
      amount: t.amount,
    };
  });

  // 선택 날짜 수입/지출 소계
  const dayIncome = selectedDayTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const dayExpense = selectedDayTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // 거래 추가 시트용 기본 날짜
  const addInitialDate = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : isSameMonth(new Date(), currentMonth)
    ? format(new Date(), "yyyy-MM-dd")
    : format(currentMonth, "yyyy-MM-dd");

  return (
    <>
      <div className="flex flex-col">
        {/* 월간 요약 - compact 1줄 */}
        <div className="flex items-center justify-around h-10 border-b border-border/60 text-[11px] px-3 bg-muted/15">
          <span className="text-muted-foreground">
            수입{" "}
            <span className="text-income font-semibold tabular-nums">
              {monthIncome.toLocaleString("ko-KR")}원
            </span>
          </span>
          <span className="text-border/80">·</span>
          <span className="text-muted-foreground">
            지출{" "}
            <span className="text-expense font-semibold tabular-nums">
              {monthExpense.toLocaleString("ko-KR")}원
            </span>
          </span>
          <span className="text-border/80">·</span>
          <span className="text-muted-foreground">
            합계{" "}
            <span
              className={cn(
                "font-semibold tabular-nums",
                monthNet >= 0 ? "text-income" : "text-expense"
              )}
            >
              {monthNet >= 0 ? "+" : ""}
              {monthNet.toLocaleString("ko-KR")}원
            </span>
          </span>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 h-8 border-b border-border/50 bg-muted/10">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "flex items-center justify-center text-[11px] font-medium",
                i === 0 ? "text-expense/80" : i === 6 ? "text-income/80" : "text-muted-foreground/70"
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 - dvh 기반으로 화면 꽉 채움 */}
        <div
          className="grid grid-cols-7"
          style={{
            gridAutoRows: `max(60px, calc((100dvh - ${NON_CALENDAR_PX}px) / ${rows}))`,
          }}
        >
          {/* 시작 오프셋 빈 셀 */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="border-b border-r border-border/30 last:border-r-0"
            />
          ))}

          {/* 날짜 셀 */}
          {days.map((day, idx) => {
            const cellIndex = startOffset + idx;
            const colIdx = cellIndex % 7;
            const rowIdx = Math.floor(cellIndex / 7);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isTodayDate = isToday(day);
            const dayOfWeek = getDay(day);
            const key = format(day, "yyyy-MM-dd");
            const dayData = dayMap.get(key);
            const isLastRow = rowIdx === rows - 1;

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "flex flex-col items-center justify-start pt-1.5 gap-0.5 cursor-pointer select-none",
                  "border-r border-border/25",
                  !isLastRow && "border-b border-border/25",
                  colIdx === 6 && "border-r-0",
                  isSelected && "bg-primary/[0.06]"
                )}
              >
                {/* 날짜 숫자 */}
                <span
                  className={cn(
                    "text-[11px] w-6 h-6 flex items-center justify-center rounded-full font-medium",
                    isSelected && "bg-primary text-primary-foreground",
                    isTodayDate && !isSelected && "bg-primary/12 text-primary font-bold",
                    !isSelected && !isTodayDate && dayOfWeek === 0 && "text-expense/80",
                    !isSelected && !isTodayDate && dayOfWeek === 6 && "text-income/80"
                  )}
                >
                  {format(day, "d")}
                </span>

                {/* 수입 금액 */}
                <span className="text-[8.5px] leading-tight text-income w-full text-center px-0.5 truncate h-3.5 tabular-nums">
                  {dayData?.income ? dayData.income.toLocaleString("ko-KR") : ""}
                </span>

                {/* 지출 금액 */}
                <span className="text-[8.5px] leading-tight text-expense w-full text-center px-0.5 truncate h-3.5 tabular-nums">
                  {dayData?.expense ? dayData.expense.toLocaleString("ko-KR") : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 거래 추가 FAB - 시트 열리면 숨김 */}
      {!isTransactionSheetOpen && (
        <button
          onClick={handleFabClick}
          className="fixed bottom-20 right-5 z-10 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.22)] active:scale-[0.91] transition-all duration-150"
          aria-label="거래 추가"
        >
          <Plus className="h-6 w-6 stroke-[2.2]" />
        </button>
      )}

      {/* 날짜 상세 바텀시트 */}
      <Drawer.Root open={isDaySheetOpen} onOpenChange={setIsDaySheetOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-30 bg-background rounded-t-[1.5rem] max-h-[75dvh] flex flex-col outline-none">
            {/* 드래그 핸들 */}
            <div className="mx-auto w-10 h-1 bg-muted-foreground/20 rounded-full mt-3 mb-1 flex-shrink-0" />

            {/* 날짜 헤더 + 소계 */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 flex-shrink-0">
              <Drawer.Title asChild>
                <h3 className="text-[15px] font-semibold">
                  {selectedDate
                    ? format(selectedDate, "M월 d일 (E)", { locale: ko })
                    : ""}
                  {selectedDate && isToday(selectedDate) && (
                    <span className="ml-2 text-[9px] text-income font-bold uppercase tracking-wider">TODAY</span>
                  )}
                </h3>
              </Drawer.Title>
              <div className="flex gap-2.5 text-[11px] tabular-nums">
                {dayIncome > 0 && (
                  <span className="text-income font-semibold">
                    +{dayIncome.toLocaleString("ko-KR")}
                  </span>
                )}
                {dayExpense > 0 && (
                  <span className="text-expense font-semibold">
                    −{dayExpense.toLocaleString("ko-KR")}
                  </span>
                )}
              </div>
            </div>

            {/* 거래 목록 - 스크롤 가능 */}
            <div className="overflow-y-auto flex-1">
              <TransactionList
                transactions={selectedDayItems}
                onItemClick={handleTransactionClick}
              />
            </div>

            {/* 이 날 거래 추가 버튼 */}
            <div className="px-5 py-4 border-t border-border/50 flex-shrink-0">
              <button
                onClick={handleDaySheetAdd}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-[13.5px] font-medium hover:bg-primary/90 active:scale-[0.99] transition-all"
              >
                이 날 거래 추가
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* 거래 등록/수정 시트 */}
      <TransactionSheet
        open={isTransactionSheetOpen}
        onOpenChange={setIsTransactionSheetOpen}
        mode={selectedTransaction ? "edit" : "create"}
        transaction={selectedTransaction ?? undefined}
        initialDate={addInitialDate}
        categories={categories}
        assets={assets}
        onSuccess={loadData}
      />
    </>
  );
}
