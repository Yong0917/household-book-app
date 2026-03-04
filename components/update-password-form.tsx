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

      {/* 폼 영역 */}
      <div className="space-y-5">
        {/* 폼 타이틀 */}
        <div>
          <h2 className="text-xl font-semibold">새 비밀번호 설정</h2>
          <p className="text-sm text-muted-foreground mt-1">
            새로운 비밀번호를 입력하세요
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          {/* 새 비밀번호 입력 */}
          <div className="grid gap-2">
            <Label htmlFor="password">새 비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="새 비밀번호"
              required
              className="h-12 text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* 비밀번호 저장 버튼 */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? "저장 중..." : "비밀번호 저장"}
          </Button>
        </form>
      </div>
    </div>
  );
}
