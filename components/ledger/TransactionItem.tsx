// 개별 거래 내역 아이템 컴포넌트 (정적 마크업)
import { cn } from "@/lib/utils";

export interface TransactionItemProps {
  id: string;
  type: "income" | "expense";
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string; // 카테고리 색상 (hex)
  description?: string;
  assetName: string;
  amount: number;
}

export function TransactionItem({
  type,
  categoryName,
  categoryColor,
  description,
  assetName,
  amount,
}: TransactionItemProps) {
  // 금액 포맷: 한국 원화 형식
  const formattedAmount = amount.toLocaleString("ko-KR") + "원";
  // 카테고리 기본 색상
  const dotColor = categoryColor ?? (type === "income" ? "#388e5a" : "#c9581a");

  return (
    <div className="flex items-center gap-3.5 px-5 py-3.5 border-b border-border/50 active:bg-muted/40 transition-colors">
      {/* 카테고리 색상 도트 */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${dotColor}18` }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      </div>

      {/* 거래 정보 영역 */}
      <div className="flex-1 min-w-0">
        {/* 카테고리명 */}
        <p className="font-medium text-[13.5px] leading-snug truncate">{categoryName}</p>

        {/* 메모 + 자산명 */}
        <p className="text-[11.5px] text-muted-foreground truncate mt-0.5">
          {description ? `${description} · ` : ""}{assetName}
        </p>
      </div>

      {/* 금액 영역 */}
      <div className="flex-shrink-0">
        <span
          className={cn(
            "font-semibold text-[13.5px] tabular-nums",
            type === "income" ? "text-income" : "text-expense"
          )}
        >
          {type === "income" ? "+" : "−"}
          {formattedAmount}
        </span>
      </div>
    </div>
  );
}
