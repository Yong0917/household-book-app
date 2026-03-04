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
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 전체 화면 중앙 정렬 레이아웃 (모바일 중심)
    <div
      className={cn(
        "min-h-svh flex flex-col justify-center px-6 py-12",
        className
      )}
      {...props}
    >
      {/* 브랜드 영역 */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <BookOpen className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">가계부</h1>
        <p className="text-sm text-muted-foreground mt-1">
          나의 수입과 지출을 기록하세요
        </p>
      </div>

      {success ? (
        /* 이메일 전송 성공 상태 */
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold">이메일을 확인하세요</h2>
            <p className="text-sm text-muted-foreground mt-1">
              비밀번호 재설정 링크를 이메일로 보냈습니다
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            입력하신 이메일로 재설정 링크가 전송되었습니다. 이메일함을 확인해
            주세요.
          </p>
          <Link
            href="/auth/login"
            className="block text-center text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      ) : (
        /* 기본 입력 폼 상태 */
        <div className="space-y-5">
          {/* 폼 타이틀 */}
          <div>
            <h2 className="text-xl font-semibold">비밀번호 재설정</h2>
            <p className="text-sm text-muted-foreground mt-1">
              이메일을 입력하면 재설정 링크를 보내드립니다
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            {/* 이메일 입력 */}
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일 주소"
                required
                className="h-12 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* 재설정 링크 전송 버튼 */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? "전송 중..." : "재설정 링크 보내기"}
            </Button>
          </form>

          {/* 로그인 링크 */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
