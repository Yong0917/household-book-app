// 설정 페이지 (서버 컴포넌트)
import Link from "next/link";
import { ChevronRight, Tag, Wallet, LogOut, Palette, RefreshCw, Shield, FileText, LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { ExportButton } from "@/components/settings/ExportButton";
import { ImportButton } from "@/components/settings/ImportButton";
import { BackupButton } from "@/components/settings/BackupButton";
import { DeleteAccountButton } from "@/components/settings/DeleteAccountButton";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isGuest = !data?.claims;

  return (
    <>
      {/* 설정 헤더 */}
      <header className="border-b border-border/40" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="h-14 flex items-center px-5">
          <h1 className="text-[17px] font-bold tracking-tight">설정</h1>
        </div>
      </header>

      {/* 데이터 관리 섹션 */}
      <div className="mt-7 px-4">
        <p className="mb-2 px-1 text-[10px] font-bold text-muted-foreground/55 uppercase tracking-[0.14em]">데이터</p>
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
          {/* 분류 관리 */}
          <Link
            href="/settings/categories"
            className="flex items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[14.5px] font-medium">분류 관리</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>

          {/* 자산 관리 */}
          <Link
            href="/settings/assets"
            className="flex items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <span className="text-[14.5px] font-medium">자산 관리</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>

          {/* 고정비 관리 */}
          <Link
            href="/settings/recurring"
            className="flex items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-[14.5px] font-medium">고정비 관리</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>

          {/* 데이터 관련 버튼은 인증 사용자만 */}
          {!isGuest && (
            <>
              <ExportButton />
              <ImportButton />
              <BackupButton />
            </>
          )}
        </div>
      </div>

      {/* 환경설정 섹션 */}
      <div className="mt-5 px-4">
        <p className="mb-2 px-1 text-[10px] font-bold text-muted-foreground/55 uppercase tracking-[0.14em]">환경설정</p>
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[14.5px] font-medium">화면 테마</span>
            </div>
            <ThemeSelector />
          </div>
        </div>
      </div>

      {/* 로그인/로그아웃 섹션 */}
      <div className="mt-5 px-4">
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
          {isGuest ? (
            <>
              {/* 게스트: 로그인/회원가입 버튼 */}
              <Link
                href="/auth/login"
                className="flex w-full items-center gap-3.5 px-4 py-4 text-foreground hover:bg-muted/40 active:bg-muted/60 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-[14.5px] font-medium">로그인</span>
              </Link>
              <Link
                href="/auth/sign-up"
                className="flex w-full items-center gap-3.5 px-4 py-4 text-foreground hover:bg-muted/40 active:bg-muted/60 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-[14.5px] font-medium">회원가입</span>
              </Link>
            </>
          ) : (
            <LogoutButton className="flex w-full items-center gap-3.5 px-4 py-4 text-foreground hover:bg-muted/40 active:bg-muted/60 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <LogOut className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-[14.5px] font-medium">로그아웃</span>
            </LogoutButton>
          )}
        </div>
      </div>

      {/* 법적 정보 */}
      <div className="mt-5 px-4">
        <p className="mb-2 px-1 text-[10px] font-bold text-muted-foreground/55 uppercase tracking-[0.14em]">법적 정보</p>
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
          <Link
            href="/privacy"
            className="flex items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <span className="text-[14.5px] font-medium">개인정보처리방침</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>
          <Link
            href="/terms"
            className="flex items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <span className="text-[14.5px] font-medium">이용약관</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </Link>
        </div>
      </div>

      {/* 회원탈퇴 - 인증 사용자만 */}
      {!isGuest && (
        <div className="mt-5 px-4 pb-6">
          <p className="mb-2 px-1 text-[10px] font-bold text-muted-foreground/55 uppercase tracking-[0.14em]">계정 관리</p>
          <div className="rounded-2xl border border-destructive/30 overflow-hidden bg-card">
            <DeleteAccountButton />
          </div>
        </div>
      )}

      {/* 게스트: 하단 여백 */}
      {isGuest && <div className="pb-6" />}
    </>
  );
}
