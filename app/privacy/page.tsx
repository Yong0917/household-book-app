export const metadata = {
  title: "개인정보처리방침 | 가계부",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">개인정보처리방침</h1>
      <p className="text-gray-400 mb-8">최종 수정일: 2026년 3월 25일</p>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">1. 수집하는 개인정보 항목</h2>
        <p>본 앱(가계부)은 서비스 제공을 위해 다음과 같은 정보를 수집합니다.</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>이메일 주소 (회원가입 및 로그인용)</li>
          <li>사용자가 직접 입력한 수입·지출 거래 내역</li>
          <li>카테고리 및 자산 설정 정보</li>
          <li>메모(노트) 내용</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">2. 개인정보 수집 및 이용 목적</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>회원 식별 및 계정 관리</li>
          <li>가계부 데이터 저장 및 동기화</li>
          <li>서비스 운영 및 오류 대응</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">3. 개인정보 보유 및 이용 기간</h2>
        <p>
          회원 탈퇴 시 모든 개인정보 및 거래 데이터는 즉시 삭제됩니다.
          단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">4. 개인정보의 제3자 제공</h2>
        <p>
          본 앱은 수집한 개인정보를 원칙적으로 외부에 제공하지 않습니다.
          단, 법령에 의한 경우는 예외로 합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">5. 개인정보 처리 위탁</h2>
        <p>본 앱은 데이터 저장 및 인증을 위해 아래 업체에 처리를 위탁합니다.</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
            <span className="font-medium">Supabase Inc.</span> — 데이터베이스 저장 및 인증 서비스
            (미국 소재, GDPR 적합성 인정)
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">6. 이용자의 권리</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>개인정보 열람, 수정, 삭제 요청 가능</li>
          <li>앱 내 설정 → 계정 삭제를 통해 모든 데이터 삭제 가능</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">7. 만 14세 미만 아동</h2>
        <p>본 앱은 만 14세 미만 아동을 대상으로 하지 않으며, 해당 연령의 개인정보를 의도적으로 수집하지 않습니다.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2">8. 문의</h2>
        <p>개인정보 처리에 관한 문의는 아래 이메일로 연락해 주세요.</p>
        <p className="mt-1 font-medium">이메일: <span className="text-blue-600">seungyong917@gmail.com</span></p>
      </section>
    </div>
  );
}
