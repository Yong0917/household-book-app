"use client";

// 가계부 월간 목록 뷰 (날짜별 그룹화) - Supabase 연동
import { useState, useEffect, useCallback } from "react";
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
import { getTransactionsByMonth } from "@/lib/actions/transactions";
import { getCategories } from "@/lib/actions/categories";
import { getAssets } from "@/lib/actions/assets";
import type { Transaction, Category, Asset } from "@/lib/mock/types";

interface DailyViewProps {
  currentMonth: Date;
}

export function DailyView({ currentMonth }: DailyViewProps) {
  // 바텀 시트 열림 상태
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // 수정 중인 거래 (null이면 create 모드)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // 서버에서 가져온 데이터
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  const loadData = useCallback(async () => {
    setIsLoading(true);
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
    setIsLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      <div className="flex items-center px-5 py-3.5 border-b border-border/60 bg-muted/20">
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">수입</p>
          {isLoading ? (
            <div className="h-3.5 w-16 bg-muted-foreground/10 rounded animate-pulse" />
          ) : (
            <p className="text-[13px] font-semibold text-income tabular-nums">
              {income.toLocaleString("ko-KR")}원
            </p>
          )}
        </div>
        <div className="h-8 w-px bg-border mx-1" />
        <div className="flex-1 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">지출</p>
          {isLoading ? (
            <div className="h-3.5 w-16 bg-muted-foreground/10 rounded animate-pulse mx-auto" />
          ) : (
            <p className="text-[13px] font-semibold text-expense tabular-nums">
              {expense.toLocaleString("ko-KR")}원
            </p>
          )}
        </div>
        <div className="h-8 w-px bg-border mx-1" />
        <div className="flex-1 text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">순합계</p>
          {isLoading ? (
            <div className="h-3.5 w-16 bg-muted-foreground/10 rounded animate-pulse ml-auto" />
          ) : (
            <p
              className={`text-[13px] font-semibold tabular-nums ${
                net >= 0 ? "text-income" : "text-expense"
              }`}
            >
              {net >= 0 ? "+" : ""}
              {net.toLocaleString("ko-KR")}원
            </p>
          )}
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
              const time = t.transactionAt.substring(11, 16);
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
              <div className="flex items-center justify-between px-5 py-2.5 bg-muted/15 border-b border-t border-border/40">
                <span className="text-[12.5px] font-medium text-foreground/75">
                  {format(dayDate, "M월 d일 (E)", { locale: ko })}
                  {isToday(dayDate) && (
                    <span className="ml-2 text-[9px] text-income font-bold uppercase tracking-wider">TODAY</span>
                  )}
                </span>
                <div className="flex gap-2.5 text-[11px] tabular-nums">
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
        onSuccess={loadData}
      />
    </>
  );
}
