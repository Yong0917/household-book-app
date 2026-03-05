"use client";

// 거래 검색 + 필터 뷰
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, SlidersHorizontal, Search, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { searchTransactions } from "@/lib/actions/transactions";
import { getCategories } from "@/lib/actions/categories";
import { getAssets } from "@/lib/actions/assets";
import type { Transaction, Category, Asset } from "@/lib/mock/types";

interface FilterState {
  startDate: string;
  endDate: string;
  assetIds: string[];
  categoryIds: string[];
  minAmount: string;
  maxAmount: string;
}

const DEFAULT_FILTER: FilterState = {
  startDate: "",
  endDate: "",
  assetIds: [],
  categoryIds: [],
  minAmount: "",
  maxAmount: "",
};

function hasFilter(f: FilterState) {
  return (
    f.startDate !== "" ||
    f.endDate !== "" ||
    f.assetIds.length > 0 ||
    f.categoryIds.length > 0 ||
    f.minAmount !== "" ||
    f.maxAmount !== ""
  );
}

interface SearchViewProps {
  onBack: () => void;
  initialFilterOpen?: boolean;
}

export function SearchView({ onBack, initialFilterOpen = false }: SearchViewProps) {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [isFilterOpen, setIsFilterOpen] = useState(initialFilterOpen);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 카테고리/자산 로드
  useEffect(() => {
    Promise.all([getCategories(), getAssets()]).then(([cats, assts]) => {
      setCategories(cats);
      setAssets(assts);
    });
  }, []);

  // 검색 실행
  const doSearch = useCallback(async (kw: string, f: FilterState) => {
    const active = kw.trim() !== "" || hasFilter(f);
    if (!active) {
      setTransactions([]);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await searchTransactions({
        keyword: kw.trim() || undefined,
        startDate: f.startDate || undefined,
        endDate: f.endDate || undefined,
        assetIds: f.assetIds.length > 0 ? f.assetIds : undefined,
        categoryIds: f.categoryIds.length > 0 ? f.categoryIds : undefined,
        minAmount: f.minAmount !== "" ? Number(f.minAmount) : undefined,
        maxAmount: f.maxAmount !== "" ? Number(f.maxAmount) : undefined,
      });
      setTransactions(results);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 키워드 또는 필터 변경 시 자동 검색 (디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(keyword, filter);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, filter, doSearch]);

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const toggleAsset = (id: string) =>
    setFilter((prev) => ({
      ...prev,
      assetIds: prev.assetIds.includes(id)
        ? prev.assetIds.filter((x) => x !== id)
        : [...prev.assetIds, id],
    }));

  const toggleCategory = (id: string) =>
    setFilter((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((x) => x !== id)
        : [...prev.categoryIds, id],
    }));

  const clearFilter = () => setFilter(DEFAULT_FILTER);

  const activeFilterCount =
    (filter.startDate || filter.endDate ? 1 : 0) +
    (filter.assetIds.length > 0 ? 1 : 0) +
    (filter.categoryIds.length > 0 ? 1 : 0) +
    (filter.minAmount || filter.maxAmount ? 1 : 0);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {/* 검색 헤더 */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/60 h-14 flex items-center px-2 gap-1">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-muted/80 transition-colors"
          aria-label="뒤로"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-[16px] font-semibold flex-1 ml-1">검색</span>
        <button
          onClick={() => setIsFilterOpen((v) => !v)}
          className={`relative p-2 rounded-full hover:bg-muted/80 transition-colors ${
            isFilterOpen || activeFilterCount > 0 ? "text-primary" : ""
          }`}
          aria-label="필터"
        >
          <SlidersHorizontal className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      </header>

      {/* 검색 입력창 */}
      <div className="px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2 bg-muted/50 rounded-2xl px-3 h-12">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            autoFocus
          />
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="h-5 w-5 flex items-center justify-center rounded-full bg-muted-foreground/30"
            >
              <X className="h-3 w-3 text-background" />
            </button>
          )}
        </div>
      </div>

      {/* 필터 패널 */}
      {isFilterOpen && (
        <div className="border-b border-border/60 bg-muted/10">
          {/* 기간 */}
          <div className="flex items-center px-4 py-3.5 border-b border-border/30">
            <span className="text-sm font-medium w-10 flex-shrink-0 text-foreground/80">기간</span>
            <div className="flex items-center gap-2 flex-1 ml-4">
              <input
                type="date"
                className="flex-1 bg-muted/60 rounded-lg px-2 py-1.5 text-xs outline-none border border-border/40 focus:border-primary/60"
                value={filter.startDate}
                onChange={(e) => setFilter((p) => ({ ...p, startDate: e.target.value }))}
              />
              <span className="text-muted-foreground text-xs">~</span>
              <input
                type="date"
                className="flex-1 bg-muted/60 rounded-lg px-2 py-1.5 text-xs outline-none border border-border/40 focus:border-primary/60"
                value={filter.endDate}
                onChange={(e) => setFilter((p) => ({ ...p, endDate: e.target.value }))}
              />
            </div>
          </div>

          {/* 자산 */}
          <div className="px-4 py-3.5 border-b border-border/30">
            <span className="text-sm font-medium text-foreground/80">자산</span>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => toggleAsset(asset.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter.assetIds.includes(asset.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {asset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 분류 */}
          <div className="px-4 py-3.5 border-b border-border/30">
            <span className="text-sm font-medium text-foreground/80">분류</span>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter.categoryIds.includes(cat.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 금액 */}
          <div className="flex items-center px-4 py-3.5">
            <span className="text-sm font-medium w-10 flex-shrink-0 text-foreground/80">금액</span>
            <div className="flex items-center gap-2 flex-1 ml-4">
              <input
                type="number"
                placeholder="최소"
                className="flex-1 bg-muted/60 rounded-lg px-2 py-1.5 text-xs outline-none border border-border/40 focus:border-primary/60 placeholder:text-muted-foreground/50"
                value={filter.minAmount}
                onChange={(e) => setFilter((p) => ({ ...p, minAmount: e.target.value }))}
              />
              <span className="text-muted-foreground text-xs">~</span>
              <input
                type="number"
                placeholder="최대"
                className="flex-1 bg-muted/60 rounded-lg px-2 py-1.5 text-xs outline-none border border-border/40 focus:border-primary/60 placeholder:text-muted-foreground/50"
                value={filter.maxAmount}
                onChange={(e) => setFilter((p) => ({ ...p, maxAmount: e.target.value }))}
              />
            </div>
          </div>

          {/* 필터 초기화 */}
          {activeFilterCount > 0 && (
            <div className="px-4 pb-3.5 flex justify-end">
              <button
                onClick={clearFilter}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          )}
        </div>
      )}

      {/* 결과 요약 */}
      {hasSearched && !isLoading && (
        <div className="flex items-center px-5 py-3.5 border-b border-border/60 bg-muted/20">
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">수입</p>
            <p className="text-[13px] font-semibold text-income tabular-nums">
              {income.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div className="h-8 w-px bg-border mx-1" />
          <div className="flex-1 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">지출</p>
            <p className="text-[13px] font-semibold text-expense tabular-nums">
              {expense.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div className="h-8 w-px bg-border mx-1" />
          <div className="flex-1 text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">이체</p>
            <p className="text-[13px] font-semibold tabular-nums text-muted-foreground">0원</p>
          </div>
        </div>
      )}

      {/* 검색 결과 목록 */}
      {transactions.length > 0 && (
        <div>
          {transactions.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId);
            const asset = assets.find((a) => a.id === t.assetId);
            return (
              <div
                key={t.id}
                className="flex items-center px-4 py-3.5 border-b border-border/30"
              >
                {/* 날짜 + 분류 */}
                <div className="w-[90px] flex-shrink-0">
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {format(parseISO(t.transactionAt), "yyyy-MM-dd")}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">{cat?.name ?? "기타"}</p>
                </div>
                {/* 내용 + 자산 */}
                <div className="flex-1 min-w-0 px-2">
                  <p className="text-sm font-medium truncate">
                    {t.description ?? cat?.name ?? "기타"}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">{asset?.name ?? "기타"}</p>
                </div>
                {/* 금액 */}
                <p
                  className={`text-sm font-semibold tabular-nums flex-shrink-0 ${
                    t.type === "income" ? "text-income" : "text-expense"
                  }`}
                >
                  {t.amount.toLocaleString("ko-KR")}원
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 검색어/필터 없을 때 안내 */}
      {!hasSearched && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Search className="h-12 w-12 text-muted-foreground/25 mb-3" />
          <p className="text-sm text-muted-foreground/50">검색어 또는 필터를 입력하세요</p>
        </div>
      )}

      {/* 결과 없을 때 */}
      {hasSearched && !isLoading && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-sm text-muted-foreground/50">검색 결과가 없습니다</p>
        </div>
      )}

      {/* 로딩 */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
