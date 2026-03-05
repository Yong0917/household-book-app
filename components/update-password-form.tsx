"use client";

// 새 비밀번호 설정 폼 컴포넌트 - 플랫 디자인 (카드 없음)
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen } from "lucide-react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // 비밀번호 변경 성공 후 가계부 메인 페이지로 이동 (버그 수정: /protected → /ledger/daily)
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
        {/* 폼 타이틀 */}
        <div className="space-y-1">
          <h2 className="text-[22px] font-bold tracking-tight">새 비밀번호 설정</h2>
          <p className="text-[13.5px] text-muted-foreground">
            새로운 비밀번호를 입력하세요
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          {/* 새 비밀번호 입력 */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[12.5px] font-semibold text-muted-foreground uppercase tracking-wide">새 비밀번호</Label>
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

          {/* 비밀번호 저장 버튼 */}
          <Button
            type="submit"
            className="w-full h-12 text-[15px] font-semibold mt-2"
            disabled={isLoading}
          >
            {isLoading ? "저장 중..." : "비밀번호 저장"}
          </Button>
        </form>
      </div>
    </div>
  );
}
