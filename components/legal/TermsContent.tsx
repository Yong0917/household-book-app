"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const VERSIONS = [
  { value: "2026-04-03", label: "2026년 4월 3일" },
  { value: "2026-03-30", label: "2026년 3월 30일" },
  { value: "2026-03-26", label: "2026년 3월 26일" },
] as const;

type Version = (typeof VERSIONS)[number]["value"];

function V20260403() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">제1조 (목적)</h2>
        <p className="text-muted-foreground">
          본 약관은 가계부 앱(이하 &ldquo;서비스&rdquo;)의 이용 조건 및 절차, 이용자와 운영자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">제2조 (용어의 정의)</h2>
        <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
          <li>&ldquo;서비스&rdquo;란 운영자가 제공하는 가계부 앱 및 관련 제반 서비스를 의미합니다.</li>
          <li>&ldquo;이용자&rdquo;란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</li>
          <li>&ldquo;계정&rdquo;이란 이용자가 서비스에 접근하기 위해 설정한 이메일 및 비밀번호 조합, 또는 소셜 로그인 계정을 의미합니다.</li>
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
          <li>영수증 스캔 (카메라 촬영 또는 앨범 선택 후 AI로 거래 정보 자동 추출)</li>
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
          탈퇴 요청 시 계정은 즉시 비활성화되며 30일간 복구 가능한 유예기간이 적용됩니다.
          유예기간이 지나면 계정과 관련 데이터는 영구 삭제되며 이후에는 복구할 수 없습니다.
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
    </>
  );
}

function V20260330() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">제1조 (목적)</h2>
        <p className="text-muted-foreground">
          본 약관은 가계부 앱(이하 &ldquo;서비스&rdquo;)의 이용 조건 및 절차, 이용자와 운영자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">제2조 (용어의 정의)</h2>
        <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
          <li>&ldquo;서비스&rdquo;란 운영자가 제공하는 가계부 앱 및 관련 제반 서비스를 의미합니다.</li>
          <li>&ldquo;이용자&rdquo;란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</li>
          <li>&ldquo;계정&rdquo;이란 이용자가 서비스에 접근하기 위해 설정한 이메일 및 비밀번호 조합, 또는 소셜 로그인 계정을 의미합니다.</li>
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
          탈퇴 요청 시 계정은 즉시 비활성화되며 30일간 복구 가능한 유예기간이 적용됩니다.
          유예기간이 지나면 계정과 관련 데이터는 영구 삭제되며 이후에는 복구할 수 없습니다.
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
    </>
  );
}

function V20260326() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">제1조 (목적)</h2>
        <p className="text-muted-foreground">
          본 약관은 가계부 앱(이하 &ldquo;서비스&rdquo;)의 이용 조건 및 절차, 이용자와 운영자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">제2조 (용어의 정의)</h2>
        <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
          <li>&ldquo;서비스&rdquo;란 운영자가 제공하는 가계부 앱 및 관련 제반 서비스를 의미합니다.</li>
          <li>&ldquo;이용자&rdquo;란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</li>
          <li>&ldquo;계정&rdquo;이란 이용자가 서비스에 접근하기 위해 설정한 이메일 및 비밀번호 조합, 또는 소셜 로그인 계정을 의미합니다.</li>
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
    </>
  );
}

export function TermsContent() {
  const [version, setVersion] = useState<Version>("2026-04-03");

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 text-sm leading-relaxed">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-muted-foreground shrink-0">최종 수정일:</span>
        <div className="relative">
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value as Version)}
            className="appearance-none bg-muted/60 text-foreground font-medium rounded-lg pl-3 pr-8 py-1.5 text-sm border-0 outline-none cursor-pointer hover:bg-muted transition-colors"
          >
            {VERSIONS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {version === "2026-04-03" && <V20260403 />}
      {version === "2026-03-30" && <V20260330 />}
      {version === "2026-03-26" && <V20260326 />}
    </div>
  );
}
