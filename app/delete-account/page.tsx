import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "계정 삭제 안내 | 가계부",
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 bg-background border-b border-border/40 z-10 px-4" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="h-14 flex items-center gap-3">
          <Link
            href="/settings"
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight">계정 삭제 안내</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 text-sm leading-relaxed">
        <p className="text-muted-foreground mb-8">최종 수정일: 2026년 3월 30일</p>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">1. 앱에서 계정 삭제 요청하는 방법</h2>
          <ol className="list-decimal ml-5 space-y-2 text-muted-foreground">
            <li>앱에 로그인합니다.</li>
            <li>하단 탭에서 <span className="font-medium text-foreground">설정</span>을 선택합니다.</li>
            <li>화면 하단의 <span className="font-medium text-foreground">회원 탈퇴</span> 버튼을 누릅니다.</li>
            <li>안내 문구를 확인한 뒤 <span className="font-medium text-foreground">탈퇴 요청</span>을 진행합니다.</li>
            <li>탈퇴 요청 후 30일 이내에는 다시 로그인하여 계정 삭제를 취소할 수 있습니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">2. 삭제되는 데이터</h2>
          <p className="text-muted-foreground mb-2">계정이 최종 삭제되면 아래 데이터가 함께 삭제됩니다.</p>
          <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
            <li>이메일 주소 및 계정 정보</li>
            <li>모든 수입·지출 거래 내역</li>
            <li>카테고리 및 자산 설정 정보</li>
            <li>고정 거래(정기결제) 설정 정보</li>
            <li>메모(노트) 및 첨부 이미지</li>
            <li>푸시 알림 수신 토큰 및 알림 이력</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">3. 데이터 보관 기간</h2>
          <p className="text-muted-foreground">
            탈퇴 요청이 접수되면 계정은 즉시 비활성화되며, 30일 동안 복구 가능한 유예기간이 적용됩니다.
            유예기간 내에는 재로그인하여 계정 삭제를 취소할 수 있고, 30일이 지나면 계정과 관련 데이터는 영구 삭제되며 복구할 수 없습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">4. 앱에 접근할 수 없는 경우</h2>
          <p className="text-muted-foreground">
            앱에 로그인할 수 없거나 앱에 접근할 수 없는 경우 아래 이메일로 계정 삭제를 요청할 수 있습니다.
            이메일 제목에 <span className="font-medium text-foreground">&ldquo;계정 삭제 요청&rdquo;</span>과 가입한 이메일 주소를 포함해 주세요.
          </p>
          <p className="mt-2">
            이메일:{" "}
            <a href="mailto:seungyong917@gmail.com" className="text-primary font-medium underline underline-offset-2">
              seungyong917@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
