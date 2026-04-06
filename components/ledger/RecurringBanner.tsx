"use client";

// 이번 달 미처리 고정비 배너 컴포넌트
import { useMemo } from "react";
import { RefreshCw, X } from "lucide-react";
import type { RecurringTransaction, Category } from "@/lib/mock/types";

interface RecurringBannerProps {
  items: RecurringTransaction[];
  categories: Category[];
  onItemClick: (item: RecurringTransaction) => void;
  onItemSkip: (item: RecurringTransaction) => void;
}

export function RecurringBanner({ items, categories, onItemClick, onItemSkip }: RecurringBannerProps) {
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  if (items.length === 0) return null;

  return (
    <div className="border-b border-border/40 bg-muted/20 px-4 py-2.5">
      {/* 헤더 */}
      <div className="flex items-center gap-1.5 mb-2">
        <RefreshCw className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
          이번 달 고정비 {items.length}건 미처리
        </span>
      </div>

      {/* 세로 리스트 */}
      <div className="flex flex-col gap-1.5 mt-2">
        {items.map((item) => {
          const cat = categoryMap.get(item.categoryId);
          return (
            <div
              key={item.id}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-background border border-border/60"
            >
              {/* 등록 버튼 영역 */}
              <button
                onClick={() => onItemClick(item)}
                className="flex items-center justify-between flex-1 min-w-0 active:opacity-60 transition-opacity"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat?.color ?? "#6b7280" }}
                  />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-[13px] font-medium text-foreground/80 truncate leading-tight">
                      {item.description || cat?.name || "고정비"}
                    </span>
                    <span className="text-[11px] text-muted-foreground/50 leading-tight mt-0.5">
                      {`매월 ${item.dayOfMonth}일`}{cat?.name && item.description ? ` · ${cat.name}` : ""}
                    </span>
                  </div>
                </div>
                <span className="text-[12px] text-muted-foreground/70 tabular-nums ml-3 flex-shrink-0">
                  {item.amount.toLocaleString("ko-KR")}원
                </span>
              </button>

              {/* 건너뜀 버튼 */}
              <button
                onClick={() => onItemSkip(item)}
                className="p-1 rounded-full hover:bg-muted/60 active:bg-muted transition-colors flex-shrink-0 ml-1"
                aria-label="건너뛰기"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground/50" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
