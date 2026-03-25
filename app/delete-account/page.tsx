export const metadata = {
  title: "계정 삭제 안내 | 가계부",
};

export default function DeleteAccountPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-bold mb-2 text-gray-900">계정 삭제 안내</h1>
      <p className="text-gray-400 mb-8">앱: 가계부 &nbsp;|&nbsp; 개발자: 신승용</p>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">계정 삭제 방법</h2>
        <ol className="list-decimal ml-5 space-y-2">
          <li>앱에 로그인합니다.</li>
          <li>하단 탭에서 <strong>설정</strong>을 선택합니다.</li>
          <li>화면 하단의 <strong>회원 탈퇴</strong> 버튼을 누릅니다.</li>
          <li>탈퇴 확인 안내를 읽고 <strong>탈퇴 요청</strong>을 누릅니다.</li>
          <li>탈퇴 요청 후 <strong>30일 이내</strong>에는 재로그인하여 취소할 수 있습니다.</li>
          <li>30일이 지나면 계정과 모든 데이터가 영구 삭제됩니다.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">삭제되는 데이터</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>이메일 주소 및 계정 정보</li>
          <li>모든 수입·지출 거래 내역</li>
          <li>카테고리 및 자산 설정</li>
          <li>고정 거래(정기결제) 설정</li>
          <li>메모(노트) 내용</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">데이터 보관 기간</h2>
        <p>
          탈퇴 요청 후 <strong>30일간</strong> 데이터가 보관됩니다 (복구 가능).
          30일 경과 후 모든 데이터는 즉시 영구 삭제되며 복구할 수 없습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">직접 삭제 요청</h2>
        <p>
          앱에 접근할 수 없는 경우 아래 이메일로 계정 삭제를 요청할 수 있습니다.
          이메일 제목에 <strong>&ldquo;계정 삭제 요청&rdquo;</strong>과 가입한 이메일 주소를 포함해 주세요.
        </p>
        <p className="mt-2 font-medium">
          이메일:{" "}
          <a href="mailto:seungyong917@gmail.com" className="text-blue-600 underline">
            seungyong917@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
}
