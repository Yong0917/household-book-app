"use client";

// 가계부 월간 목록 뷰 (날짜별 그룹화) - 데이터는 LedgerTabView에서 props로 전달
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  format,
  isSameMonth,
  parseISO,
  isToday,
  compareAsc,
} from "date-fns";
import { ko } from "date-fns/locale";
import { TransactionList } from "@/components/ledger/TransactionList";
import { TransactionSheet } from "@/components/ledger/TransactionSheet";
import type { Transaction, Category, Asset } from "@/lib/mock/types";

interface DailyViewProps {
  currentMonth: Date;
  transactions: Transaction[];
  categories: Category[];
  assets: Asset[];
  isLoading: boolean;
  onSuccess: () => void;
}

export function DailyView({ currentMonth, transactions, categories, assets, isLoading, onSuccess }: DailyViewProps) {
  // 바텀 시트 열림 상태
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // 수정 중인 거래 (null이면 create 모드)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // 현재 월 거래 필터링 (transaction_at이 해당 월인지 확인)
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
      {/* 월간 수입/지출/순합계 요약 */}
      <div className="px-4 py-3 border-b border-border/40">
        <div className="grid grid-cols-3 divide-x divide-border/40 bg-muted/20 rounded-xl px-1 py-3">
          <div className="flex flex-col gap-1.5 pl-3 pr-2">
            <p className="text-[9.5px] text-muted-foreground/55 font-bold uppercase tracking-[0.12em]">수입</p>
            {isLoading ? (
              <div className="h-4 w-16 bg-muted-foreground/10 rounded animate-pulse" />
            ) : (
              <p className="text-[13.5px] font-semibold text-income tabular-nums leading-none tracking-tight">
                {income.toLocaleString("ko-KR")}
                <span className="text-[11px] font-medium ml-0.5">원</span>
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 px-3 items-center">
            <p className="text-[9.5px] text-muted-foreground/55 font-bold uppercase tracking-[0.12em]">지출</p>
            {isLoading ? (
              <div className="h-4 w-16 bg-muted-foreground/10 rounded animate-pulse" />
            ) : (
              <p className="text-[13.5px] font-semibold text-expense tabular-nums leading-none tracking-tight">
                {expense.toLocaleString("ko-KR")}
                <span className="text-[11px] font-medium ml-0.5">원</span>
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 pl-3 pr-2 items-end">
            <p className="text-[9.5px] text-muted-foreground/55 font-bold uppercase tracking-[0.12em]">잔액</p>
            {isLoading ? (
              <div className="h-4 w-16 bg-muted-foreground/10 rounded animate-pulse" />
            ) : (
              <p
                className={`text-[13.5px] font-semibold tabular-nums leading-none tracking-tight ${
                  net >= 0 ? "text-income" : "text-expense"
                }`}
              >
                {net >= 0 ? "+" : ""}
                {net.toLocaleString("ko-KR")}
                <span className="text-[11px] font-medium ml-0.5">원</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 날짜별 그룹화된 거래 목록 */}
      {isLoading ? (
        <div className="flex flex-col gap-px">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="flex items-center justify-between px-5 py-2.5 bg-muted/15 border-b border-t border-border/40">
                <div className="h-3 w-24 bg-muted-foreground/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted-foreground/10 rounded animate-pulse" />
              </div>
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex items-center gap-3 px-5 py-3.5 border-b border-border/30">
                  <div className="h-9 w-9 rounded-full bg-muted-foreground/10 animate-pulse flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-3 w-20 bg-muted-foreground/10 rounded animate-pulse" />
                    <div className="h-2.5 w-14 bg-muted-foreground/8 rounded animate-pulse" />
                  </div>
                  <div className="h-3.5 w-16 bg-muted-foreground/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground/60 text-sm">거래 내역이 없습니다</p>
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

          // 시간순(오름차순) 정렬 후 TransactionList에 전달할 데이터 변환
          const listItems = [...dayTransactions]
            .sort((a, b) => compareAsc(parseISO(b.transactionAt), parseISO(a.transactionAt)))
            .map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              const time = format(parseISO(t.transactionAt), "HH:mm");
              return {
                id: t.id,
                type: t.type,
                categoryName: cat?.name ?? "기타",
                categoryColor: cat?.color,
                description: t.description,
                assetName: assets.find((a) => a.id === t.assetId)?.name ?? "기타",
                amount: t.amount,
                time,
              };
            });

          return (
            <div key={dateKey}>
              {/* 날짜 구분 헤더 */}
              <div className="flex items-center justify-between px-5 pt-3.5 pb-2 bg-muted/10 border-b border-border/30">
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] font-bold tabular-nums leading-none text-foreground/85 tracking-tight">
                    {format(dayDate, "d")}
                  </span>
                  <span className="text-[11.5px] text-muted-foreground/70 font-medium tracking-tight">
                    {format(dayDate, "M월", { locale: ko })} · {format(dayDate, "EEEE", { locale: ko })}
                  </span>
                  {isToday(dayDate) && (
                    <span className="text-[9px] bg-income/10 text-income font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">TODAY</span>
                  )}
                </div>
                <div className="flex gap-2.5 text-[11px] tabular-nums tracking-tight">
                  {dayIncome > 0 && (
                    <span className="text-income font-medium">
                      +{dayIncome.toLocaleString("ko-KR")}
                    </span>
                  )}
                  {dayExpense > 0 && (
                    <span className="text-expense font-medium">
                      −{dayExpense.toLocaleString("ko-KR")}
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

      {/* 거래 추가 FAB 버튼 - 시트 열리면 숨김 */}
      {!isSheetOpen && (
        <button
          onClick={handleAddClick}
          className="fixed bottom-20 right-5 z-10 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.22)] active:scale-[0.91] transition-all duration-150"
          aria-label="거래 추가"
        >
          <Plus className="h-6 w-6 stroke-[2.2]" />
        </button>
      )}

      {/* 거래 등록/수정 바텀 시트 */}
      <TransactionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        mode={selectedTransaction ? "edit" : "create"}
        transaction={selectedTransaction ?? undefined}
        initialDate={defaultDate}
        categories={categories}
        assets={assets}
        onSuccess={onSuccess}
      />
    </>
  );
}
