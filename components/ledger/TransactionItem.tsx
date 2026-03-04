// 개별 거래 내역 아이템 컴포넌트 (정적 마크업)
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TransactionItemProps {
  id: string;
  type: "income" | "expense";
  categoryName: string;
  categoryIcon?: string; // lucide 아이콘명 (미사용, 기본값 Circle)
  description?: string;
  assetName: string;
  amount: number;
}

export function TransactionItem({
  type,
  categoryName,
  description,
  assetName,
  amount,
}: TransactionItemProps) {
  // 금액 포맷: 한국 원화 형식
  const formattedAmount = amount.toLocaleString("ko-KR") + "원";

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      {/* 카테고리 아이콘 영역 */}
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Circle className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* 거래 정보 영역 */}
      <div className="flex-1 min-w-0">
        {/* 카테고리명 */}
        <p className="font-medium text-sm truncate">{categoryName}</p>

        {/* 거래 내용 (선택사항) */}
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}

        {/* 자산명 */}
        <p className="text-xs text-muted-foreground">{assetName}</p>
      </div>

      {/* 금액 영역 */}
      <div className="flex-shrink-0">
        <span
          className={cn(
            "font-medium text-sm",
            // 수입은 파란색, 지출은 빨간색
            type === "income" ? "text-blue-500" : "text-red-500"
          )}
        >
          {type === "income" ? "+" : "-"}
          {formattedAmount}
        </span>
      </div>
    </div>
  );
}
