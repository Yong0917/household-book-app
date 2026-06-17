"use client";

// 로그인 폼 컴포넌트 - 플랫 디자인 (카드 없음)
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";
import { translateAuthError } from "@/lib/auth-errors";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import {
  isAndroidApp,
  isBiometricLoginEnabled,
  biometricLogin,
  clearBiometricLogin,
} from "@/lib/utils/biometric";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const router = useRouter();

  // Android 앱이고 생체로그인이 등록돼 있으면 버튼 노출
  useEffect(() => {
    if (isAndroidApp() && isBiometricLoginEnabled()) setBioAvailable(true);
  }, []);

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = await biometricLogin();
      if (!tokens) {
        // 사용자 취소 — 조용히 폼 유지
        setIsLoading(false);
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      if (error) {
        // 저장 토큰 만료/무효 → 등록 해제 후 일반 로그인 유도
        clearBiometricLogin();
        setBioAvailable(false);
        setError("생체인증 정보가 만료되었습니다. 다시 로그인해 주세요.");
        setIsLoading(false);
        return;
      }
      router.replace("/ledger/daily");
    } catch {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // 탈퇴 요청 계정이면 계정 복구 페이지로 이동
      if (data.user?.user_metadata?.deletion_requested_at) {
        router.replace("/auth/account-recovery");
      } else {
        router.replace("/ledger/daily");
      }
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-512.png"
          alt="가계부"
          className="w-[88px] h-[88px] rounded-[24px] mb-5 select-none"
          style={{ boxShadow: "0 8px 32px hsl(197 60% 42% / 0.22), 0 2px 8px hsl(197 60% 42% / 0.10)" }}
          draggable={false}
        />
        <h1 className="text-[24px] font-bold tracking-tight text-foreground">머니로그</h1>
        <p className="text-[13.5px] text-muted-foreground mt-1.5">
          수입과 지출을 한눈에
        </p>
      </div>

      {/* 폼 영역 */}
      <div className="space-y-6">
        {/* 폼 타이틀 */}
        <div className="space-y-1">
          <h2 className="text-[22px] font-bold tracking-tight">로그인</h2>
          <p className="text-[13.5px] text-muted-foreground">
            이메일과 비밀번호를 입력하세요
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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

          {/* 비밀번호 입력 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[12.5px] font-semibold text-muted-foreground uppercase tracking-wide">비밀번호</Label>
              <Link
                href="/auth/forgot-password"
                className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-12 text-[15px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-[13px] text-destructive bg-destructive/8 px-3.5 py-2.5 rounded-xl border border-destructive/15">
              {error}
            </p>
          )}

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            className="w-full h-12 text-[15px] font-semibold mt-2 shadow-[0_4px_16px_hsl(197_60%_42%_/_0.30)] active:scale-[0.98] transition-all duration-150"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        {/* 생체인증 로그인 (Android 앱 + 등록된 경우만) */}
        {bioAvailable && (
          <button
            type="button"
            onClick={handleBiometricLogin}
            disabled={isLoading}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-border bg-background text-[14.5px] font-medium text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Fingerprint className="h-[18px] w-[18px]" />
            생체인증으로 로그인
          </button>
        )}

        {/* 둘러보기 버튼 */}
        <button
          type="button"
          onClick={() => router.push("/ledger/daily")}
          className="w-full text-center text-[13px] text-muted-foreground py-1.5 hover:text-foreground transition-colors"
        >
          로그인 없이 둘러보기
        </button>

        {/* 소셜 로그인 */}
        <SocialLoginButtons />

        {/* 약관 링크 */}
        <p className="text-center text-[11.5px] text-muted-foreground/60">
          <Link href="/terms" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">이용약관</Link>
          {" · "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">개인정보처리방침</Link>
        </p>
      </div>
    </div>
  );
}
