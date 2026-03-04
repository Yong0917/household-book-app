"use client";

// 분류 관리 페이지
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CategoryList } from "@/components/settings/CategoryList";

export default function CategoriesPage() {
  const router = useRouter();

  return (
    <>
      {/* 분류 관리 헤더 */}
      <header className="h-14 flex items-center gap-3 px-4 border-b">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">분류 관리</h1>
      </header>

      {/* 카테고리 목록 컴포넌트 */}
      <CategoryList />
    </>
  );
}
