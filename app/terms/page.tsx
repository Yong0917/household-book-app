import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "이용약관 | 가계부",
};

export default function TermsPage() {
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
          <h1 className="text-[17px] font-bold tracking-tight">이용약관</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 text-sm leading-relaxed">
        <p className="text-muted-foreground mb-8">최종 수정일: 2026년 3월 26일</p>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제1조 (목적)</h2>
          <p className="text-muted-foreground">
            본 약관은 가계부 앱(이하 "서비스")의 이용 조건 및 절차, 이용자와 운영자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제2조 (용어의 정의)</h2>
          <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
            <li>"서비스"란 운영자가 제공하는 가계부 앱 및 관련 제반 서비스를 의미합니다.</li>
            <li>"이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</li>
            <li>"계정"이란 이용자가 서비스에 접근하기 위해 설정한 이메일 및 비밀번호 조합, 또는 소셜 로그인 계정을 의미합니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제3조 (약관의 효력 및 변경)</h2>
          <p className="text-muted-foreground">
            본 약관은 서비스 내 또는 앱 스토어를 통해 공지함으로써 효력이 발생합니다.
            운영자는 합리적인 사유 발생 시 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일 이후부터 효력이 발생합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제4조 (서비스 이용)</h2>
          <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
            <li>서비스는 만 14세 이상의 이용자에게 제공됩니다.</li>
            <li>이용자는 정확한 정보를 제공하여 계정을 생성해야 합니다.</li>
            <li>하나의 이메일 주소로 하나의 계정만 생성할 수 있습니다.</li>
            <li>계정 및 비밀번호 관리 책임은 이용자 본인에게 있습니다.</li>
            <li>Google 소셜 로그인을 이용하는 경우, Google의 이용약관이 함께 적용됩니다.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제5조 (서비스의 내용)</h2>
          <p className="text-muted-foreground mb-2">본 서비스는 다음의 기능을 제공합니다.</p>
          <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
            <li>수입·지출 거래 기록 및 조회 (일별·달력)</li>
            <li>카테고리 및 자산 관리</li>
            <li>고정비(반복 거래) 관리</li>
            <li>수입·지출 통계 및 카테고리별 분석</li>
            <li>메모(노트) 작성 및 관리</li>
            <li>데이터 내보내기(엑셀), 가져오기, 전체 백업</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제6조 (이용자의 의무)</h2>
          <p className="text-muted-foreground mb-2">이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
            <li>타인의 정보를 도용하거나 허위 정보를 등록하는 행위</li>
            <li>서비스의 운영을 방해하거나 서버에 과도한 부하를 주는 행위</li>
            <li>법령 또는 본 약관을 위반하는 행위</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제7조 (서비스 제공 및 변경)</h2>
          <p className="text-muted-foreground">
            운영자는 서비스의 내용을 변경하거나 일시 중단할 수 있습니다.
            서비스 중단 시 사전에 앱 내 공지를 통해 안내하며, 불가피한 경우 사후에 공지할 수 있습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제8조 (데이터 및 책임 제한)</h2>
          <p className="text-muted-foreground">
            서비스 내 저장된 데이터는 이용자 본인이 직접 입력한 정보입니다.
            운영자는 이용자의 부주의나 시스템 장애로 인한 데이터 손실에 대해 법령이 정한 범위 내에서 책임을 집니다.
            중요한 데이터는 앱 내 설정 → 전체 데이터 백업 기능을 활용하시기 바랍니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제9조 (계정 해지)</h2>
          <p className="text-muted-foreground">
            이용자는 앱 내 설정 → 계정 삭제를 통해 언제든지 서비스 이용을 해지할 수 있습니다.
            계정 삭제 시 모든 데이터는 즉시 삭제되며 복구할 수 없습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제10조 (준거법 및 분쟁 해결)</h2>
          <p className="text-muted-foreground">
            본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련하여 분쟁이 발생한 경우 운영자와 이용자 간의 합의를 우선으로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-base font-semibold mb-2">제11조 (문의)</h2>
          <p className="text-muted-foreground">이용약관에 관한 문의는 아래 이메일로 연락해 주세요.</p>
          <p className="mt-1">이메일: <span className="text-primary font-medium">seungyong917@gmail.com</span></p>
        </section>
      </div>
    </div>
  );
}
