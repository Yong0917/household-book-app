// 가계부 월 캐시(CacheEntry)에 거래 변경을 로컬 반영하는 순수 함수.
// 저장 확정 직후 재조회 없이 목록을 즉시 갱신하기 위해 사용한다.
import { format, parseISO } from "date-fns";
import type { Transaction, Category, Asset, RecurringTransaction } from "@/lib/mock/types";

export type CacheEntry = {
  transactions: Transaction[];
  categories: Category[];
  assets: Asset[];
  recurring: RecurringTransaction[];
};

export type TransactionChange =
  | { kind: "create" | "update"; transaction: Transaction; recurringId?: string }
  | { kind: "delete"; id: string }
  | { kind: "skip"; recurringId: string };

// 거래가 속한 월 키 ("yyyy-MM", KST 기기 로컬 해석 — 기존 월 키 계산과 동일 규칙)
export function transactionMonthKey(transactionAt: string): string {
  return format(parseISO(transactionAt), "yyyy-MM");
}

// transaction_at DESC 정렬을 유지하며 삽입
// (서버 반환값과 toISOString 값의 표기가 섞일 수 있어 문자열 비교 대신 시각 비교)
function insertSorted(list: Transaction[], tx: Transaction): Transaction[] {
  const time = Date.parse(tx.transactionAt);
  const idx = list.findIndex((t) => Date.parse(t.transactionAt) <= time);
  const next = [...list];
  next.splice(idx === -1 ? next.length : idx, 0, tx);
  return next;
}

// 변경(추가/수정/삭제/고정비 건너뜀)을 monthKey 월의 캐시에 반영한 새 엔트리 반환
export function applyChangeToEntry(
  entry: CacheEntry,
  change: TransactionChange,
  monthKey: string
): CacheEntry {
  let transactions = entry.transactions;
  let recurring = entry.recurring;

  switch (change.kind) {
    case "create": {
      if (transactionMonthKey(change.transaction.transactionAt) === monthKey) {
        transactions = insertSorted(transactions, change.transaction);
      }
      // 고정비에서 반영된 거래면 미처리 고정비 목록에서 제거
      if (change.recurringId) {
        recurring = recurring.filter((r) => r.id !== change.recurringId);
      }
      break;
    }
    case "update": {
      const without = transactions.filter((t) => t.id !== change.transaction.id);
      // 수정 후에도 이 월에 속하면 정렬 위치에 재삽입, 다른 월로 이동했으면 제거만
      transactions =
        transactionMonthKey(change.transaction.transactionAt) === monthKey
          ? insertSorted(without, change.transaction)
          : without;
      break;
    }
    case "delete": {
      transactions = transactions.filter((t) => t.id !== change.id);
      break;
    }
    case "skip": {
      recurring = recurring.filter((r) => r.id !== change.recurringId);
      break;
    }
  }

  return { ...entry, transactions, recurring };
}
