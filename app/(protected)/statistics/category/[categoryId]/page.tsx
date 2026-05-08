// 카테고리 상세 통계 - 서버 컴포넌트로 초기 데이터 prefetch
import { format, startOfMonth, subMonths } from "date-fns";
import { searchTransactions } from "@/lib/actions/transactions";
import { getCategories } from "@/lib/actions/categories";
import { getAssets } from "@/lib/actions/assets";
import { CategoryDetailClient } from "@/components/statistics/CategoryDetailClient";
import type { TransactionType } from "@/lib/mock/types";

interface PageProps {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ month?: string; type?: string }>;
}

export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
  const { categoryId } = await params;
  const sp = await searchParams;

  const type: TransactionType = sp.type === "income" ? "income" : "expense";

  const monthDate = (() => {
    if (sp.month) {
      const [y, m] = sp.month.split("-").map(Number);
      if (y && m) return startOfMonth(new Date(y, m - 1, 1));
    }
    return startOfMonth(new Date());
  })();
  const monthKey = format(monthDate, "yyyy-MM");

  const rangeStart = subMonths(monthDate, 7);
  const startDate = format(rangeStart, "yyyy-MM-dd");
  const endDate = format(
    new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0),
    "yyyy-MM-dd"
  );

  const [initialTransactions, categories, assets] = await Promise.all([
    searchTransactions({ categoryIds: [categoryId], startDate, endDate, type }),
    getCategories(),
    getAssets(),
  ]);

  return (
    <CategoryDetailClient
      categoryId={categoryId}
      initialMonth={monthKey}
      type={type}
      initialTransactions={initialTransactions}
      categories={categories}
      assets={assets}
    />
  );
}
