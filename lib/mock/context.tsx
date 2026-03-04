"use client";

// Mock 데이터 전역 Context - Phase 2용 인메모리 상태 관리
import { createContext, useContext, useState } from "react";
import {
  INITIAL_CATEGORIES,
  INITIAL_ASSETS,
  INITIAL_TRANSACTIONS,
} from "./data";
import type { Category, Asset, Transaction, TransactionType, AssetType } from "./types";

// Context 타입 정의
interface MockContextValue {
  // 상태
  transactions: Transaction[];
  categories: Category[];
  assets: Asset[];

  // 거래 액션
  addTransaction: (data: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;

  // 카테고리 액션
  addCategory: (data: Omit<Category, "id">) => void;
  updateCategory: (id: string, data: Partial<Omit<Category, "id">>) => void;
  deleteCategory: (id: string) => void;

  // 자산 액션
  addAsset: (data: Omit<Asset, "id">) => void;
  updateAsset: (id: string, data: Partial<Omit<Asset, "id">>) => void;
  deleteAsset: (id: string) => void;
}

// Context 생성
const MockContext = createContext<MockContextValue | null>(null);

// Provider 컴포넌트
export function MockProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);

  // 거래 추가
  const addTransaction = (data: Omit<Transaction, "id">) => {
    setTransactions((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
  };

  // 거래 수정
  const updateTransaction = (id: string, data: Partial<Omit<Transaction, "id">>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  };

  // 거래 삭제
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // 카테고리 추가
  const addCategory = (data: Omit<Category, "id">) => {
    setCategories((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
  };

  // 카테고리 수정
  const updateCategory = (id: string, data: Partial<Omit<Category, "id">>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  };

  // 카테고리 삭제 (기본 카테고리는 삭제 불가)
  const deleteCategory = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category?.isDefault) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // 자산 추가
  const addAsset = (data: Omit<Asset, "id">) => {
    setAssets((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
  };

  // 자산 수정
  const updateAsset = (id: string, data: Partial<Omit<Asset, "id">>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a))
    );
  };

  // 자산 삭제 (기본 자산은 삭제 불가)
  const deleteAsset = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (asset?.isDefault) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <MockContext.Provider
      value={{
        transactions,
        categories,
        assets,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addAsset,
        updateAsset,
        deleteAsset,
      }}
    >
      {children}
    </MockContext.Provider>
  );
}

// useMock 훅
export function useMock(): MockContextValue {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error("useMock은 MockProvider 내부에서만 사용할 수 있습니다");
  }
  return context;
}

// 타입 재export (편의상)
export type { TransactionType, AssetType };
