"use client";

// 자산 관리 페이지
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AssetList } from "@/components/settings/AssetList";

export default function AssetsPage() {
  const router = useRouter();

  return (
    <>
      {/* 자산 관리 헤더 */}
      <header className="h-14 flex items-center gap-3 px-4 border-b">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">자산 관리</h1>
      </header>

      {/* 자산 목록 컴포넌트 */}
      <AssetList />
    </>
  );
}
