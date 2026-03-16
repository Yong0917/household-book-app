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
import { BookOpen, Fingerprint } from "lucide-react";
import {
  isBiometricAvailable,
  isBiometricRegistered,
  getBiometricEmail,
  authenticateWithBiometric,
  updateBiometricTokens,
} from "@/lib/biometric";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEmail, setBiometricEmail] = useState<string | null>(null);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    isBiometricAvailable().then((available) => {
      if (available && isBiometricRegistered()) {
        setBiometricAvailable(true);
        setBiometricEmail(getBiometricEmail());
      }
    });
  }, []);

  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);
    setError(null);

    try {
      const { accessToken, refreshToken } = await authenticateWithBiometric();
      const supabase = createClient();

      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) throw sessionError;

      // 갱신된 토큰으로 저장 데이터 업데이트
      if (data.session) {
        updateBiometricTokens(data.session.access_token, data.session.refresh_token);
      }

      router.push("/ledger/daily");
    } catch (err: unknown) {
      // 사용자가 취소한 경우는 에러 메시지 표시 안 함
      const message = err instanceof Error ? err.message : "";
      if (!message.includes("cancel") && !message.includes("NotAllowed")) {
        setError("생체인증에 실패했습니다. 비밀번호로 로그인해 주세요.");
      }
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // 인증 성공 후 가계부 메인 페이지로 이동
      router.push("/ledger/daily");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
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

      {/* 폼 영역 */}
      <div className="space-y-6">
        {/* 생체인증 로그인 버튼 — 등록된 경우만 표시 */}
        {biometricAvailable && (
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-[15px] font-semibold flex items-center gap-2.5 border-border/60"
              onClick={handleBiometricLogin}
              disabled={isBiometricLoading}
            >
              <Fingerprint className="h-5 w-5" />
              {isBiometricLoading ? "인증 중..." : "생체인증으로 로그인"}
            </Button>
            {biometricEmail && (
              <p className="text-center text-[12px] text-muted-foreground">{biometricEmail}</p>
            )}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">또는</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
          </div>
        )}

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
            className="w-full h-12 text-[15px] font-semibold mt-2"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        {/* 회원가입 링크 */}
        <p className="text-center text-[13.5px] text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link
            href="/auth/sign-up"
            className="text-foreground font-semibold hover:opacity-70 transition-opacity"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
