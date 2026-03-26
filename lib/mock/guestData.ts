// 게스트 미리보기용 샘플 데이터

import type { Category, Asset, Transaction } from "./types";

export const GUEST_CATEGORIES: Category[] = [
  { id: "gc-1", name: "식비",   type: "expense", color: "#FF6B6B", isDefault: true, sortOrder: 1 },
  { id: "gc-2", name: "교통",   type: "expense", color: "#4ECDC4", isDefault: true, sortOrder: 2 },
  { id: "gc-3", name: "쇼핑",   type: "expense", color: "#96CEB4", isDefault: true, sortOrder: 3 },
  { id: "gc-4", name: "카페",   type: "expense", color: "#F9CA24", isDefault: true, sortOrder: 4 },
  { id: "gc-5", name: "의료",   type: "expense", color: "#DDA0DD", isDefault: true, sortOrder: 5 },
  { id: "gc-6", name: "문화",   type: "expense", color: "#6C5CE7", isDefault: true, sortOrder: 6 },
  { id: "gc-7", name: "급여",   type: "income",  color: "#00B894", isDefault: true, sortOrder: 7 },
  { id: "gc-8", name: "부수입", type: "income",  color: "#A29BFE", isDefault: true, sortOrder: 8 },
];

export const GUEST_ASSETS: Asset[] = [
  { id: "ga-1", name: "현금",     type: "cash", isDefault: true, sortOrder: 1 },
  { id: "ga-2", name: "국민은행", type: "bank", isDefault: true, sortOrder: 2 },
  { id: "ga-3", name: "신한카드", type: "card", isDefault: true, sortOrder: 3 },
];

// 현재 날짜 기준으로 monthOffset 개월 전의 날짜 문자열 생성 (0 = 이번 달)
function dt(monthOffset: number, day: number, hour = 12, min = 0): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, day, hour, min, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

// 이번 달(0), 지난달(-1), 2달 전(-2) 기준 샘플 거래 내역
export const GUEST_TRANSACTIONS: Transaction[] = [
  // 이번 달
  { id: "gt-001", type: "income",  amount: 3200000, categoryId: "gc-7", assetId: "ga-2", description: "이번 달 급여",    transactionAt: dt(0, 25,  9,  0) },
  { id: "gt-002", type: "expense", amount:   68000, categoryId: "gc-1", assetId: "ga-3", description: "마트 장보기",      transactionAt: dt(0, 24, 18, 30) },
  { id: "gt-003", type: "expense", amount:    4500, categoryId: "gc-4", assetId: "ga-3", description: "스타벅스",         transactionAt: dt(0, 24,  9, 15) },
  { id: "gt-004", type: "expense", amount:   32000, categoryId: "gc-1", assetId: "ga-3", description: "점심 외식",        transactionAt: dt(0, 22, 12, 30) },
  { id: "gt-005", type: "expense", amount:    1500, categoryId: "gc-2", assetId: "ga-1", description: "버스",             transactionAt: dt(0, 22,  8, 20) },
  { id: "gt-006", type: "expense", amount:   89000, categoryId: "gc-3", assetId: "ga-3", description: "온라인 쇼핑",      transactionAt: dt(0, 20, 14,  0) },
  { id: "gt-007", type: "expense", amount:   25000, categoryId: "gc-6", assetId: "ga-3", description: "영화 관람",        transactionAt: dt(0, 19, 19, 30) },
  { id: "gt-008", type: "expense", amount:   15000, categoryId: "gc-1", assetId: "ga-1", description: "편의점",           transactionAt: dt(0, 18, 22, 10) },
  { id: "gt-009", type: "expense", amount:   45000, categoryId: "gc-5", assetId: "ga-3", description: "병원비",           transactionAt: dt(0, 17, 10,  0) },
  { id: "gt-010", type: "expense", amount:    5800, categoryId: "gc-4", assetId: "ga-3", description: "투썸플레이스",     transactionAt: dt(0, 15, 14, 20) },
  { id: "gt-011", type: "income",  amount:  150000, categoryId: "gc-8", assetId: "ga-2", description: "중고거래",         transactionAt: dt(0, 14, 16,  0) },
  { id: "gt-012", type: "expense", amount:   56000, categoryId: "gc-1", assetId: "ga-3", description: "고기 외식",        transactionAt: dt(0, 13, 19,  0) },
  { id: "gt-013", type: "expense", amount:   24000, categoryId: "gc-2", assetId: "ga-2", description: "택시비",           transactionAt: dt(0, 12, 23, 30) },
  { id: "gt-014", type: "expense", amount:   12000, categoryId: "gc-1", assetId: "ga-3", description: "배달 음식",        transactionAt: dt(0, 10, 20,  0) },
  { id: "gt-015", type: "expense", amount:   38000, categoryId: "gc-3", assetId: "ga-3", description: "옷 구매",          transactionAt: dt(0,  8, 13,  0) },
  { id: "gt-016", type: "expense", amount:    4200, categoryId: "gc-4", assetId: "ga-1", description: "아메리카노",       transactionAt: dt(0,  7,  8, 30) },
  { id: "gt-017", type: "expense", amount:    7500, categoryId: "gc-2", assetId: "ga-2", description: "지하철 충전",      transactionAt: dt(0,  5,  7, 50) },
  { id: "gt-018", type: "expense", amount:   42000, categoryId: "gc-1", assetId: "ga-3", description: "주말 외식",        transactionAt: dt(0,  1, 18,  0) },

  // 지난달
  { id: "gt-101", type: "income",  amount: 3200000, categoryId: "gc-7", assetId: "ga-2", description: "지난달 급여",      transactionAt: dt(-1, 25,  9,  0) },
  { id: "gt-102", type: "expense", amount:   72000, categoryId: "gc-1", assetId: "ga-3", description: "마트 장보기",      transactionAt: dt(-1, 23, 17,  0) },
  { id: "gt-103", type: "expense", amount:    5500, categoryId: "gc-4", assetId: "ga-3", description: "카페",             transactionAt: dt(-1, 22, 10,  0) },
  { id: "gt-104", type: "expense", amount:   98000, categoryId: "gc-3", assetId: "ga-3", description: "의류 쇼핑",        transactionAt: dt(-1, 20, 14,  0) },
  { id: "gt-105", type: "expense", amount:   28000, categoryId: "gc-1", assetId: "ga-3", description: "점심",             transactionAt: dt(-1, 18, 12, 30) },
  { id: "gt-106", type: "expense", amount:   18000, categoryId: "gc-6", assetId: "ga-3", description: "전시 관람",        transactionAt: dt(-1, 15, 14,  0) },
  { id: "gt-107", type: "expense", amount:    1500, categoryId: "gc-2", assetId: "ga-1", description: "버스",             transactionAt: dt(-1, 14,  8,  0) },
  { id: "gt-108", type: "expense", amount:   35000, categoryId: "gc-1", assetId: "ga-3", description: "저녁 외식",        transactionAt: dt(-1, 14, 19, 30) },
  { id: "gt-109", type: "expense", amount:   16000, categoryId: "gc-1", assetId: "ga-1", description: "편의점",           transactionAt: dt(-1, 12, 21,  0) },
  { id: "gt-110", type: "expense", amount:   25000, categoryId: "gc-2", assetId: "ga-2", description: "택시",             transactionAt: dt(-1, 10, 22,  0) },
  { id: "gt-111", type: "expense", amount:    4800, categoryId: "gc-4", assetId: "ga-3", description: "라떼",             transactionAt: dt(-1,  8,  9,  0) },
  { id: "gt-112", type: "expense", amount:   55000, categoryId: "gc-5", assetId: "ga-3", description: "치과",             transactionAt: dt(-1,  5, 11,  0) },
  { id: "gt-113", type: "expense", amount:    9000, categoryId: "gc-2", assetId: "ga-2", description: "지하철",           transactionAt: dt(-1,  3,  8,  0) },
  { id: "gt-114", type: "expense", amount:   48000, categoryId: "gc-1", assetId: "ga-3", description: "외식",             transactionAt: dt(-1,  1, 18, 30) },

  // 2달 전
  { id: "gt-201", type: "income",  amount: 3200000, categoryId: "gc-7", assetId: "ga-2", description: "2달 전 급여",      transactionAt: dt(-2, 25,  9,  0) },
  { id: "gt-202", type: "expense", amount:   85000, categoryId: "gc-1", assetId: "ga-3", description: "마트",             transactionAt: dt(-2, 22, 17,  0) },
  { id: "gt-203", type: "expense", amount:  120000, categoryId: "gc-3", assetId: "ga-3", description: "쇼핑",             transactionAt: dt(-2, 18, 14,  0) },
  { id: "gt-204", type: "expense", amount:    6000, categoryId: "gc-4", assetId: "ga-3", description: "카페",             transactionAt: dt(-2, 15, 10,  0) },
  { id: "gt-205", type: "income",  amount:  200000, categoryId: "gc-8", assetId: "ga-2", description: "부수입",           transactionAt: dt(-2, 10, 12,  0) },
  { id: "gt-206", type: "expense", amount:   65000, categoryId: "gc-1", assetId: "ga-3", description: "외식",             transactionAt: dt(-2,  8, 19,  0) },
];

// 월별 게스트 데이터 반환 (가계부 탭용)
export function getGuestMonthData(year: number, month: number) {
  const transactions = GUEST_TRANSACTIONS.filter((t) => {
    const d = new Date(t.transactionAt);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  return { transactions, categories: GUEST_CATEGORIES, assets: GUEST_ASSETS, recurring: [] };
}

// 통계 페이지용 게스트 데이터 반환
export function getGuestStatisticsData(year: number, month: number, count: number) {
  const months: { year: number; month: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  const transactions = GUEST_TRANSACTIONS.filter((t) => {
    const d = new Date(t.transactionAt);
    return months.some((m) => m.year === d.getFullYear() && m.month === d.getMonth() + 1);
  });

  const trend = months.map((m) => {
    const monthTx = GUEST_TRANSACTIONS.filter((t) => {
      const d = new Date(t.transactionAt);
      return d.getFullYear() === m.year && d.getMonth() + 1 === m.month;
    });
    return {
      year: m.year,
      month: m.month,
      label: `${m.month}월`,
      income:  monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  return { transactions, categories: GUEST_CATEGORIES, trend };
}
