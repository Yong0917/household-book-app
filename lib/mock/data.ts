// Mock 초기 데이터

import type { Category, Asset, Transaction } from "./types";

// 기본 카테고리 데이터 (수입 5개, 지출 10개)
export const INITIAL_CATEGORIES: Category[] = [
  // 수입 카테고리
  { id: "c1", name: "급여", type: "income", color: "#3b82f6", isDefault: true, sortOrder: 0 },
  { id: "c2", name: "부수입", type: "income", color: "#22c55e", isDefault: true, sortOrder: 1 },
  { id: "c3", name: "이자", type: "income", color: "#14b8a6", isDefault: true, sortOrder: 2 },
  { id: "c4", name: "투자수익", type: "income", color: "#8b5cf6", isDefault: true, sortOrder: 3 },
  { id: "c5", name: "기타수입", type: "income", color: "#6b7280", isDefault: true, sortOrder: 4 },
  // 지출 카테고리
  { id: "c6", name: "식비", type: "expense", color: "#ef4444", isDefault: true, sortOrder: 0 },
  { id: "c7", name: "교통", type: "expense", color: "#f97316", isDefault: true, sortOrder: 1 },
  { id: "c8", name: "주거", type: "expense", color: "#eab308", isDefault: true, sortOrder: 2 },
  { id: "c9", name: "의료", type: "expense", color: "#22c55e", isDefault: true, sortOrder: 3 },
  { id: "c10", name: "쇼핑", type: "expense", color: "#ec4899", isDefault: true, sortOrder: 4 },
  { id: "c11", name: "문화", type: "expense", color: "#8b5cf6", isDefault: true, sortOrder: 5 },
  { id: "c12", name: "교육", type: "expense", color: "#3b82f6", isDefault: true, sortOrder: 6 },
  { id: "c13", name: "통신", type: "expense", color: "#14b8a6", isDefault: true, sortOrder: 7 },
  { id: "c14", name: "저축", type: "expense", color: "#f59e0b", isDefault: true, sortOrder: 8 },
  { id: "c15", name: "기타지출", type: "expense", color: "#6b7280", isDefault: true, sortOrder: 9 },
];

// 기본 자산 데이터
export const INITIAL_ASSETS: Asset[] = [
  { id: "a1", name: "현금", type: "cash", isDefault: true, sortOrder: 0 },
  { id: "a2", name: "신한은행", type: "bank", isDefault: true, sortOrder: 1 },
  { id: "a3", name: "삼성카드", type: "card", isDefault: true, sortOrder: 2 },
];

// 샘플 거래 데이터 (2026년 3월, 12건)
export const INITIAL_TRANSACTIONS: Transaction[] = [
  // 수입
  { id: "t1", type: "income", amount: 3000000, categoryId: "c1", assetId: "a2", description: "3월 급여", transactionAt: "2026-03-05T09:00:00" },
  { id: "t2", type: "income", amount: 150000, categoryId: "c2", assetId: "a1", description: "블로그 광고비", transactionAt: "2026-03-10T14:00:00" },
  { id: "t3", type: "income", amount: 32000, categoryId: "c3", assetId: "a2", description: "은행 이자", transactionAt: "2026-03-15T10:00:00" },
  { id: "t4", type: "income", amount: 250000, categoryId: "c4", assetId: "a2", description: "주식 배당금", transactionAt: "2026-03-20T11:00:00" },
  // 지출
  { id: "t5", type: "expense", amount: 45000, categoryId: "c6", assetId: "a3", description: "점심 식사", transactionAt: "2026-03-03T12:30:00" },
  { id: "t6", type: "expense", amount: 12000, categoryId: "c7", assetId: "a2", description: "교통카드 충전", transactionAt: "2026-03-04T08:00:00" },
  { id: "t7", type: "expense", amount: 650000, categoryId: "c8", assetId: "a2", description: "월세", transactionAt: "2026-03-01T09:00:00" },
  { id: "t8", type: "expense", amount: 35000, categoryId: "c6", assetId: "a1", description: "저녁 식사", transactionAt: "2026-03-07T19:00:00" },
  { id: "t9", type: "expense", amount: 89000, categoryId: "c10", assetId: "a3", description: "의류 구매", transactionAt: "2026-03-12T15:00:00" },
  { id: "t10", type: "expense", amount: 55000, categoryId: "c13", assetId: "a2", description: "휴대폰 요금", transactionAt: "2026-03-15T09:00:00" },
  { id: "t11", type: "expense", amount: 25000, categoryId: "c11", assetId: "a3", description: "영화 관람", transactionAt: "2026-03-18T20:00:00" },
  { id: "t12", type: "expense", amount: 300000, categoryId: "c14", assetId: "a2", description: "정기 적금", transactionAt: "2026-03-25T10:00:00" },
];
