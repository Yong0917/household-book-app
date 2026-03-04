// 인증 오류 페이지 - 플랫 디자인 (카드 없음)
import { AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

// 에러 코드 표시 컴포넌트 (비동기 searchParams 처리)
async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          Code error: {params.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          An unspecified error occurred.
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="min-h-svh flex flex-col justify-center px-6 py-12">
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

      {/* 에러 아이콘 */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
      </div>

      {/* 에러 내용 */}
      <div className="space-y-5">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-xl font-semibold">오류가 발생했습니다</h2>
          <Suspense>
            <ErrorContent searchParams={searchParams} />
          </Suspense>
        </div>

        {/* 로그인 페이지 이동 버튼 */}
        <Button asChild className="w-full h-12 text-base font-medium">
          <Link href="/auth/login">로그인으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}
