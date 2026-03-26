// 고정비 관리 페이지 (Server Component)
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { RecurringList } from "@/components/settings/RecurringList";
import { getRecurringTransactions } from "@/lib/actions/recurring";
import { getCategories } from "@/lib/actions/categories";
import { getAssets } from "@/lib/actions/assets";
import { createClient } from "@/lib/supabase/server";

export default async function RecurringPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isGuest = !data?.claims;

  const listData = isGuest
    ? null
    : await Promise.all([
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

      {isGuest ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-24">
          <Lock className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">로그인 후 이용할 수 있습니다</p>
          <Link href="/auth/login" className="text-[13.5px] font-semibold text-primary hover:opacity-70 transition-opacity">
            로그인하기
          </Link>
        </div>
      ) : (
        <RecurringList
          initialItems={listData![0]}
          categories={listData![1]}
          assets={listData![2]}
        />
      )}
    </>
  );
}
