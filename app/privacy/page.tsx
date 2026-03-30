import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "개인정보처리방침 | 가계부",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* 헤더 */}
      <header className="sticky top-0 bg-background border-b border-border/40 z-10 px-4" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="h-14 flex items-center gap-3">
          <Link
            href="/settings"
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight">개인정보처리방침</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 text-sm leading-relaxed">
        <p className="text-muted-foreground mb-8">최종 수정일: 2026년 3월 30일</p>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">1. 수집하는 개인정보 항목</h2>
          <p className="text-muted-foreground">본 앱(가계부)은 서비스 제공을 위해 다음과 같은 정보를 수집합니다.</p>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-muted-foreground">
            <li>이메일 주소 (이메일 회원가입 및 로그인용)</li>
            <li>구글 계정 정보 (소셜 로그인 이용 시: 이메일, 프로필 이름)</li>
            <li>사용자가 직접 입력한 수입·지출 거래 내역</li>
            <li>카테고리 및 자산 설정 정보</li>
            <li>고정비(반복 거래) 설정 정보</li>
            <li>메모(노트) 내용</li>
            <li>푸시 알림 수신 이력 (알림 유형, 제목, 내용, 발송 시각)</li>
            <li>FCM 디바이스 토큰 (푸시 알림 발송용, 앱 설치 기기에서만 수집)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">2. 개인정보 수집 및 이용 목적</h2>
          <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
            <li>회원 식별 및 계정 관리</li>
            <li>가계부 데이터 저장 및 기기 간 동기화</li>
            <li>고정비 결제일 알림 및 월별 결산 리포트 푸시 발송</li>
            <li>수신된 알림 이력 조회 기능 제공</li>
            <li>서비스 운영 및 오류 대응</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">3. 개인정보 보유 및 이용 기간</h2>
          <p className="text-muted-foreground">
            회원이 탈퇴를 요청하면 계정 및 관련 데이터는 즉시 비활성화되며, 30일간의 유예기간 동안 보관됩니다.
            이용자는 유예기간 내 재로그인하여 탈퇴를 취소할 수 있고, 30일이 경과하면 모든 개인정보 및 거래 데이터는 영구 삭제됩니다.
            단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 별도로 보관될 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">4. 개인정보의 제3자 제공</h2>
          <p className="text-muted-foreground">
            본 앱은 수집한 개인정보를 원칙적으로 외부에 제공하지 않습니다.
            단, 법령에 의한 경우는 예외로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">5. 개인정보 처리 위탁</h2>
          <p className="text-muted-foreground">본 앱은 데이터 저장 및 인증을 위해 아래 업체에 처리를 위탁합니다.</p>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Supabase Inc.</span> — 데이터베이스 저장 및 인증 서비스 (미국 소재, GDPR 적합성 인정)
            </li>
            <li>
              <span className="font-medium text-foreground">Google LLC</span> — 소셜 로그인(Google OAuth) 및 푸시 알림(Firebase Cloud Messaging) 서비스 제공
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">6. 이용자의 권리</h2>
          <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
            <li>개인정보 열람, 수정, 삭제 요청 가능</li>
            <li>앱 내 설정 → 계정 삭제를 통해 모든 데이터 삭제 가능</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">7. 만 14세 미만 아동</h2>
          <p className="text-muted-foreground">본 앱은 만 14세 미만 아동을 대상으로 하지 않으며, 해당 연령의 개인정보를 의도적으로 수집하지 않습니다.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">8. 문의</h2>
          <p className="text-muted-foreground">개인정보 처리에 관한 문의는 아래 이메일로 연락해 주세요.</p>
          <p className="mt-1">이메일: <span className="text-primary font-medium">seungyong917@gmail.com</span></p>
        </section>
      </div>
    </div>
  );
}
