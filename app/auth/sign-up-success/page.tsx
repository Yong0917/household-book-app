// 회원가입 완료 안내 페이지 - 이메일 인증 안내 정적 페이지
import { BookOpen, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
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

      {/* 이메일 확인 안내 아이콘 */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center">
          <Mail className="h-10 w-10 text-blue-500" />
        </div>
      </div>

      {/* 안내 텍스트 */}
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-xl font-semibold">이메일을 확인해 주세요</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          회원가입이 완료되었습니다.
          <br />
          이메일 인증 링크를 확인하고 계정을 활성화하세요.
        </p>
      </div>

      {/* 로그인 페이지 이동 버튼 */}
      <Button asChild className="h-12 text-base font-medium">
        <Link href="/auth/login">로그인으로 이동</Link>
      </Button>
    </div>
  );
}
