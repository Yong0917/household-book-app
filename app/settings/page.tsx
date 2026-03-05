// 설정 페이지 (서버 컴포넌트)
import Link from "next/link";
import { ChevronRight, Tag, Wallet, LogOut, Palette } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { ExportButton } from "@/components/settings/ExportButton";

export default function SettingsPage() {
  return (
    <>
      {/* 설정 헤더 */}
      <header className="h-14 flex items-center px-5 border-b border-border/50">
        <h1 className="text-[18px] font-bold tracking-tight">설정</h1>
      </header>

      {/* 데이터 관리 섹션 */}
      <div className="mt-7 px-4">
        <p className="mb-2 px-1 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">데이터</p>
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
          {/* 분류 관리 */}
          <Link
            href="/settings/categories"
            className="flex items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                <Tag className="h-4 w-4 text-foreground/70" />
              </div>
              <span className="text-[14.5px] font-medium">분류 관리</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </Link>

          {/* 자산 관리 */}
          <Link
            href="/settings/assets"
            className="flex items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                <Wallet className="h-4 w-4 text-foreground/70" />
              </div>
              <span className="text-[14.5px] font-medium">자산 관리</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          </Link>

          {/* 엑셀 내보내기 */}
          <ExportButton />
        </div>
      </div>

      {/* 환경설정 섹션 */}
      <div className="mt-5 px-4">
        <p className="mb-2 px-1 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">환경설정</p>
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                <Palette className="h-4 w-4 text-foreground/70" />
              </div>
              <span className="text-[14.5px] font-medium">화면 테마</span>
            </div>
            <ThemeSelector />
          </div>
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="mt-5 px-4">
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
          <LogoutButton className="flex w-full items-center gap-3.5 px-4 py-4 text-destructive hover:bg-destructive/5 active:bg-destructive/10 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-[14.5px] font-medium">로그아웃</span>
          </LogoutButton>
        </div>
      </div>
    </>
  );
}
