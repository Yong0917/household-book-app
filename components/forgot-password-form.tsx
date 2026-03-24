"use client";

// 비밀번호 재설정 요청 폼 컴포넌트 - 플랫 디자인 (카드 없음)
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { BookOpen } from "lucide-react";
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

      {success ? (
        /* 이메일 전송 성공 상태 */
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-[22px] font-bold tracking-tight">이메일을 확인하세요</h2>
            <p className="text-[13.5px] text-muted-foreground">
              비밀번호 재설정 링크를 이메일로 보냈습니다
            </p>
          </div>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            입력하신 이메일로 재설정 링크가 전송되었습니다. 이메일함을 확인해 주세요.
          </p>
          <Link
            href="/auth/login"
            className="block text-center text-[13.5px] text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 로그인으로 돌아가기
          </Link>
        </div>
      ) : (
        /* 기본 입력 폼 상태 */
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
      )}
    </div>
  );
}
