"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const VERSIONS = [
  { value: "2026-04-03", label: "2026년 4월 3일" },
  { value: "2026-03-30", label: "2026년 3월 30일" },
  { value: "2026-03-25", label: "2026년 3월 25일" },
] as const;

type Version = (typeof VERSIONS)[number]["value"];

function V20260403() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">1. 수집하는 개인정보 항목</h2>
        <p className="text-muted-foreground">본 앱(가계부)은 서비스 제공을 위해 다음과 같은 정보를 수집합니다.</p>
        <ul className="list-disc ml-5 mt-2 space-y-1 text-muted-foreground">
          <li>이메일 주소 (이메일 회원가입 및 로그인용)</li>
          <li>구글 계정 정보 (소셜 로그인 이용 시: 이메일, 프로필 이름)</li>
          <li>사용자가 직접 입력한 수입·지출 거래 내역</li>
          <li>카테고리 및 자산 설정 정보</li>
          <li>고정비(반복 거래) 설정 정보</li>
          <li>메모(노트) 내용 및 첨부 이미지</li>
          <li>영수증 이미지 (카메라 촬영 또는 앨범 선택 시, AI 분석 후 서버에 저장되지 않음)</li>
          <li>푸시 알림 수신 이력 (알림 유형, 제목, 내용, 발송 시각)</li>
          <li>FCM 디바이스 토큰 (푸시 알림 발송용, 앱 설치 기기에서만 수집)</li>
        </ul>
        <p className="text-muted-foreground mt-3 text-xs">
          ※ 영수증 스캔 기능 이용 시 카메라 및 사진 라이브러리 접근 권한이 필요합니다. 해당 권한은 영수증 이미지 선택 목적으로만 사용되며, 이미지는 AI 분석 즉시 처리되고 서버에 보관되지 않습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">2. 개인정보 수집 및 이용 목적</h2>
        <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
          <li>회원 식별 및 계정 관리</li>
          <li>가계부 데이터 저장 및 기기 간 동기화</li>
          <li>영수증 이미지 AI 분석을 통한 거래 정보 자동 입력</li>
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
            <span className="font-medium text-foreground">Google LLC</span> — 소셜 로그인(Google OAuth), 푸시 알림(Firebase Cloud Messaging), 영수증 이미지 AI 분석(Google Gemini API) 서비스 제공
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
    </>
  );
}

function V20260330() {
  return (
    <>
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
    </>
  );
}

function V20260325() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">1. 수집하는 개인정보 항목</h2>
        <p className="text-muted-foreground">본 앱(가계부)은 서비스 제공을 위해 다음과 같은 정보를 수집합니다.</p>
        <ul className="list-disc ml-5 mt-2 space-y-1 text-muted-foreground">
          <li>이메일 주소 (회원가입 및 로그인용)</li>
          <li>사용자가 직접 입력한 수입·지출 거래 내역</li>
          <li>카테고리 및 자산 설정 정보</li>
          <li>메모(노트) 내용</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">2. 개인정보 수집 및 이용 목적</h2>
        <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
          <li>회원 식별 및 계정 관리</li>
          <li>가계부 데이터 저장 및 동기화</li>
          <li>서비스 운영 및 오류 대응</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">3. 개인정보 보유 및 이용 기간</h2>
        <p className="text-muted-foreground">
          회원 탈퇴 시 모든 개인정보 및 거래 데이터는 즉시 삭제됩니다.
          단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관됩니다.
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
    </>
  );
}

export function PrivacyContent() {
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
      {version === "2026-03-25" && <V20260325 />}
    </div>
  );
}
