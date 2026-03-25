// 회원가입 완료 안내 페이지 - 이메일 인증 안내 정적 페이지
import { Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-12">
      {/* 메인 카드 */}
      <div className="w-full max-w-sm flex flex-col items-center text-center">

        {/* 아이콘 영역 */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Mail className="h-11 w-11 text-blue-500" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* 타이틀 */}
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          이메일을 확인해 주세요
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          가입하신 이메일로 인증 링크를 보냈어요.
          <br />
          링크를 클릭하면 바로 시작할 수 있어요.
        </p>

        {/* 안내 박스 */}
        <div className="w-full bg-muted/50 rounded-xl px-4 py-3.5 mb-8 text-left space-y-1.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            📬 메일이 오지 않으면 스팸함을 확인해 주세요.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ⏱ 인증 링크는 24시간 동안 유효합니다.
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
