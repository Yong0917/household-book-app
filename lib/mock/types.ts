// Mock 데이터 타입 정의

export type TransactionType = "income" | "expense";

export type AssetType = "cash" | "bank" | "card" | "other";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  isDefault: boolean;
  sortOrder: number;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  isDefault: boolean;
  sortOrder: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  assetId: string;
  description?: string;
  transactionAt: string; // ISO 날짜 문자열 (예: '2026-03-04T09:00:00')
}
