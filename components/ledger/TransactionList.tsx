// 거래 내역 목록 컴포넌트 (정적 마크업)
import { TransactionItem, TransactionItemProps } from "./TransactionItem";

interface TransactionListProps {
  transactions: TransactionItemProps[];
  // TODO: 클릭 이벤트 로직 구현 필요
  onItemClick?: (id: string) => void;
}

export function TransactionList({ transactions, onItemClick }: TransactionListProps) {
  // 거래 내역이 없는 경우 빈 상태 표시
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground text-sm">거래 내역이 없습니다</p>
      </div>
    );
  }

  // 거래 내역 목록 렌더링
  return (
    <div>
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          onClick={() => onItemClick?.(transaction.id)}
          className="cursor-pointer"
        >
          <TransactionItem {...transaction} />
        </div>
      ))}
    </div>
  );
}
