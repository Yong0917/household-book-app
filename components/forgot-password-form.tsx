"use client";

// 비밀번호 재설정 요청 폼 컴포넌트 - 플랫 디자인 (카드 없음)
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { BookOpen, Mail, KeyRound } from "lucide-react";
import { translateAuthError } from "@/lib/auth-errors";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // 이메일에 포함될 비밀번호 재설정 리다이렉트 URL
      // Supabase 대시보드 redirect URLs에 등록 필요
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(translateAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={cn("min-h-svh flex flex-col items-center justify-center px-6 py-12", className)} {...props}>
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          {/* 아이콘 영역 */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Mail className="h-11 w-11 text-blue-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
              <KeyRound className="h-3.5 w-3.5 text-white" />
            </div>
          </div>

          {/* 타이틀 */}
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            이메일을 확인해 주세요
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            비밀번호 재설정 링크를 보냈어요.
            <br />
            링크를 클릭해 새 비밀번호를 설정하세요.
          </p>

          {/* 안내 박스 */}
          <div className="w-full bg-muted/50 rounded-xl px-4 py-3.5 mb-8 text-left space-y-1.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              📬 메일이 오지 않으면 스팸함을 확인해 주세요.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ⏱ 재설정 링크는 1시간 동안 유효합니다.
            </p>
          </div>

          {/* 버튼 */}
          <Button asChild className="w-full h-12 text-base font-medium">
            <Link href="/auth/login">로그인 화면으로</Link>
          </Button>

          {/* 하단 앱명 */}
          <p className="mt-8 text-xs text-muted-foreground/50">머니 로그</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-svh flex flex-col justify-center px-7 py-14",
        className
      )}
      {...props}
    >
      {/* 브랜드 영역 */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <BookOpen className="h-[22px] w-[22px] text-background" strokeWidth={1.75} />
        </div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">가계부</h1>
        <p className="text-[13px] text-muted-foreground mt-1.5">
          수입과 지출을 한 눈에
        </p>
      </div>

      {/* 기본 입력 폼 */}
      <div className="space-y-6">
        {/* 폼 타이틀 */}
        <div className="space-y-1">
          <h2 className="text-[22px] font-bold tracking-tight">비밀번호 재설정</h2>
          <p className="text-[13.5px] text-muted-foreground">
            이메일을 입력하면 재설정 링크를 보내드립니다
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          {/* 이메일 입력 */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[12.5px] font-semibold text-muted-foreground uppercase tracking-wide">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              className="h-12 text-[15px]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-[13px] text-destructive bg-destructive/8 px-3.5 py-2.5 rounded-xl border border-destructive/15">
              {error}
            </p>
          )}

          {/* 재설정 링크 전송 버튼 */}
          <Button
            type="submit"
            className="w-full h-12 text-[15px] font-semibold mt-2"
            disabled={isLoading}
          >
            {isLoading ? "전송 중..." : "재설정 링크 보내기"}
          </Button>
        </form>

        {/* 로그인 링크 */}
        <p className="text-center text-[13.5px] text-muted-foreground">
          <Link
            href="/auth/login"
            className="hover:text-foreground transition-colors"
          >
            ← 로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
