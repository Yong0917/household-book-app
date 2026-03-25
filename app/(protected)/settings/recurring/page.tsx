// 고정비 관리 페이지 (Server Component)
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RecurringList } from "@/components/settings/RecurringList";
import { getRecurringTransactions } from "@/lib/actions/recurring";
import { getCategories } from "@/lib/actions/categories";
import { getAssets } from "@/lib/actions/assets";

export default async function RecurringPage() {
  const [recurring, categories, assets] = await Promise.all([
    getRecurringTransactions(),
    getCategories(),
    getAssets(),
  ]);

  return (
    <>
      {/* 고정비 관리 헤더 */}
      <header className="sticky top-0 bg-background border-b z-10 px-4" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="h-14 flex items-center gap-3">
        <Link
          href="/settings"
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">고정비 관리</h1>
      </div>
      </header>

      {/* 고정비 목록 컴포넌트 */}
      <RecurringList
        initialItems={recurring}
        categories={categories}
        assets={assets}
      />
    </>
  );
}
