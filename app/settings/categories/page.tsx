// 분류 관리 페이지 (Server Component)
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryList } from "@/components/settings/CategoryList";
import { getCategories } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      {/* 분류 관리 헤더 */}
      <header className="h-14 flex items-center gap-3 px-4 border-b">
        <Link
          href="/settings"
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">분류 관리</h1>
      </header>

      {/* 카테고리 목록 컴포넌트 */}
      <CategoryList initialCategories={categories} />
    </>
  );
}
