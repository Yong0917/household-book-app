// 설정 페이지 (서버 컴포넌트)
import Link from "next/link";
import { ChevronRight, Tag, Wallet, LogOut, Palette } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSelector } from "@/components/settings/ThemeSelector";

export default function SettingsPage() {
  return (
    <>
      {/* 설정 헤더 */}
      <header className="h-14 flex items-center px-4 border-b">
        <h1 className="text-lg font-semibold">설정</h1>
      </header>

      {/* 설정 메뉴 목록 */}
      <div className="mt-4">
        <div className="divide-y border-t border-b">
          {/* 분류 관리 메뉴 */}
          <Link
            href="/settings/categories"
            className="flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">분류 관리</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          {/* 자산 관리 메뉴 */}
          <Link
            href="/settings/assets"
            className="flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">자산 관리</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          {/* 테마 설정 */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">화면 테마</span>
            </div>
            <ThemeSelector />
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div className="mt-8 px-4">
        <LogoutButton className="flex items-center gap-3 text-red-500 text-sm font-medium py-2">
          <LogOut className="h-5 w-5" />
          로그아웃
        </LogoutButton>
      </div>
    </>
  );
}
