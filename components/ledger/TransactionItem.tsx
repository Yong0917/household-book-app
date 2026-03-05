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
  time?: string; // HH:mm 형식 시간
}

export function TransactionItem({
  type,
  categoryName,
  categoryColor,
  description,
  assetName,
  amount,
  time,
}: TransactionItemProps) {
  // 금액 포맷: 한국 원화 형식
  const formattedAmount = amount.toLocaleString("ko-KR") + "원";
  // 카테고리 기본 색상
  const dotColor = categoryColor ?? (type === "income" ? "#388e5a" : "#c9581a");

  return (
    <div className="flex items-center gap-3.5 px-5 py-3.5 border-b border-border/40 active:bg-muted/30 transition-colors duration-100">
      {/* 카테고리 색상 아이콘 */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${dotColor}1A` }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      </div>

      {/* 거래 정보 영역 */}
      <div className="flex-1 min-w-0">
        {/* 메모(없으면 카테고리명) */}
        <p className="font-semibold text-[13.5px] leading-snug truncate text-foreground/90">
          {description || categoryName}
        </p>

        {/* 시간 + 카테고리명 + 자산명 */}
        <p className="text-[11.5px] text-muted-foreground/75 truncate mt-0.5">
          {time ? `${time} · ` : ""}{description ? `${categoryName} · ` : ""}{assetName}
        </p>
      </div>

      {/* 금액 영역 */}
      <div className="flex-shrink-0">
        <span
          className={cn(
            "font-bold text-[14px] tabular-nums",
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
