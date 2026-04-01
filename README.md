<div align="center">

# MoneyLog

**수입과 지출을 한 눈에 — 나만을 위한 스마트 가계부**

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Supported-5A0FC8?style=flat-square&logo=pwa)

</div>

---

## 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [화면 미리보기](#2-화면-미리보기)
3. [주요 기능](#3-주요-기능)
4. [기술 스택](#4-기술-스택)
5. [아키텍처](#5-아키텍처)
6. [구현 포인트](#6-구현-포인트)
7. [데이터베이스 스키마](#7-데이터베이스-스키마)
8. [라우트 구조](#8-라우트-구조)
9. [시작하기](#9-시작하기)

---

## 1. 프로젝트 소개

MoneyLog는 **Next.js 15 App Router + Supabase** 기반으로 제작한 개인 가계부 웹 앱입니다.

모바일 퍼스트 디자인으로 스마트폰에서도 네이티브 앱처럼 편리하게 사용할 수 있으며, PWA를 통해 홈 화면에 추가하면 앱처럼 실행됩니다. 거래 기록부터 통계 시각화, 고정비 자동화, 고급 검색·필터, 엑셀 내보내기·가져오기, FCM 푸시 알림, 소셜 로그인까지 일상적인 가계 관리에 필요한 모든 기능을 담았습니다.

Android WebView로 래핑한 네이티브 앱(`money-logs-android`)과 함께 동작하며, FCM 푸시 알림·소셜 로그인(Google/Kakao)·딥링크 등 네이티브 브릿지 연동을 지원합니다.

---

## 2. 화면 미리보기

| 로그인 | 일별 가계부 | 달력 뷰 |
|:---:|:---:|:---:|
| ![로그인](docs/screenshots/01-login.png) | ![일별 뷰](docs/screenshots/02-daily.png) | ![달력 뷰](docs/screenshots/03-calendar.png) |

| 통계 | 설정 | 거래 추가 |
|:---:|:---:|:---:|
| ![통계](docs/screenshots/04-statistics.png) | ![설정](docs/screenshots/05-settings.png) | ![거래 추가](docs/screenshots/06-add-transaction.png) |

---

## 3. 주요 기능

### 가계부 기록
- **일별 뷰** — 날짜별 거래 목록과 수입/지출/잔액 합계를 한눈에 확인
- **달력 뷰** — 월간 달력에서 날짜별 금액 요약 조회, 날짜 클릭으로 상세 뷰 이동
- **거래 CRUD** — 수입/지출 등록·수정·삭제. 카테고리, 자산, 날짜·시간, 메모 지원
- **영수증 스캔** — 영수증·결제 캡처 이미지를 Gemini AI로 분석해 금액·상호명·날짜 자동 입력
- **메모 자동완성** — 과거 메모 기반 입력 추천으로 반복 입력 최소화
- **고정비 배너** — 미처리 고정 수입/지출을 상단 배너로 안내, 원클릭 등록 또는 건너뛰기

### 검색 & 필터
- **키워드 검색** — 메모 기준 전체 기간 검색 (디바운스 300ms 자동 실행)
- **멀티 필터** — 기간 / 자산 / 카테고리 / 금액 범위를 조합해 정밀 조회
- **검색 결과 요약** — 필터 결과의 수입·지출 합계 즉시 표시

### 통계 & 분석
- **도넛 차트** — 월별 수입·지출을 카테고리별 비율로 시각화
- **카테고리 상세** — 카테고리 클릭 시 8개월 트렌드 라인 차트 + 거래 목록 조회
- **월별 추이 차트** — 최근 N개월 수입/지출 추이 비교
- **월별 리포트** — 월 단위 상세 통계, 일일 지출 차트, 카테고리별 분석
- **월 선택 피커** — 연·월 단위로 원하는 기간 통계 탐색

### 고정비 관리
- **고정비 등록** — 매월 반복되는 수입/지출을 결제일(1~31일)과 함께 등록
- **미처리 알림** — 결제일이 지난 미등록 고정비를 가계부 상단 배너로 안내
- **빠른 등록** — 배너 클릭 시 금액·카테고리·자산이 자동 채워진 시트 오픈
- **건너뛰기** — 특정 달에 등록하지 않을 항목은 건너뛰기로 배너에서 제거

### 메모장
- **메모 목록** — 핀 고정 메모를 상단에 우선 표시, 최신 수정순 정렬
- **메모 작성** — 제목 + 본문 입력, 명시적 저장 버튼으로 의도치 않은 저장 방지
- **메모 상세** — 전체화면 편집기(`/notes/[id]`)에서 기존 메모 수정
- **이미지 첨부** — 메모에 이미지 업로드 및 뷰어 지원
- **핀 고정** — 중요한 메모를 목록 최상단에 고정
- **메모 삭제** — 개별 메모 삭제

### 알림 & 푸시
- **FCM 푸시 알림** — Android 앱에서 고정비 결제일, 월별 결산 알림 수신
- **알림 히스토리** — 받은 알림 목록 날짜별 그룹화, 유형별 아이콘 (고정비/월말요약/월결산)
- **알림 설정** — 설정 화면에서 푸시 알림 on/off 토글, FCM 토큰 자동 등록·해제

### 인증 & 계정
- **이메일 인증** — 회원가입 후 이메일 OTP 인증, 비밀번호 재설정
- **소셜 로그인** — Google(Chrome Custom Tab), Kakao(WebView) OAuth 지원
- **Android 딥링크** — OAuth 완료 후 앱 스킴(`com.moneylogs.app://auth-callback`)으로 복귀
- **계정 탈퇴 (30일 유예)** — 탈퇴 요청 후 30일 유예기간, 기간 내 복구 가능
- **계정 복구** — 탈퇴 예정 계정 로그인 시 복구 페이지 자동 안내

### 관리자 기능
- **영수증 스캔 접근 관리** — 일반 사용자는 관리자 승인 후 영수증 스캔 기능 사용 가능
- **접근 요청 플로우** — 미승인 사용자가 스캔 버튼 클릭 시 승인 요청 → 관리자가 설정 페이지에서 승인/거부
- **접근 상태** — `none` (미요청) / `pending` (대기) / `approved` (승인) / `denied` (거부) 4단계

### 데이터 관리
- **카테고리 관리** — 커스텀 카테고리 생성·수정·삭제, 색상 팔레트, 드래그 앤 드롭 순서 변경
- **자산 관리** — 카드·현금·계좌 등 자산 등록·수정·삭제, 드래그 앤 드롭 순서 변경
- **엑셀 내보내기** — 기간 선택(이번달/지난달/올해/전체/직접선택) 후 `.xlsx` 다운로드
- **엑셀 가져오기** — 열 자동 매핑, 수동 매핑 지원, 분류·자산 자동 매칭
- **전체 백업** — 모든 데이터를 JSON 파일로 백업 (거래·카테고리·자산·고정비·메모)

### 게스트 모드
- **미리보기** — 로그인 없이 샘플 데이터로 앱 탐색 가능
- **로그인 게이트** — 데이터 저장이 필요한 기능 접근 시 로그인 안내 모달 표시

### UX & 접근성
- **다크 모드** — 라이트/다크/시스템 설정 연동 테마 전환
- **PWA** — 홈 화면 추가 후 앱처럼 실행, 서비스 워커 기반 오프라인 캐싱
- **뒤로가기 지원** — History API로 오버레이/상세 화면에서 네이티브 뒤로가기 동작
- **모바일 최적화** — safe-area-inset 대응, Vaul Drawer, 스와이프 월 전환, 터치 최적화 UI
- **URL 상태 유지** — `?month=yyyy-MM` 쿼리 파라미터로 새로고침 시 선택 달 유지

---

## 4. 기술 스택

### Frontend

| 분류 | 기술 | 선택 이유 |
|---|---|---|
| 프레임워크 | Next.js 15 (App Router) | Server Components + Server Actions로 API Route 없이 Supabase 직접 통신 |
| 언어 | TypeScript 5 | 타입 안전성으로 런타임 오류 사전 차단 |
| 스타일 | Tailwind CSS 3 | 유틸리티 클래스 기반의 빠른 스타일링, 다크 모드 클래스 전환 용이 |
| UI 컴포넌트 | shadcn/ui + Radix UI | 접근성 보장된 헤드리스 컴포넌트, 커스터마이징 자유도 |
| 드로어 | Vaul | 모바일 바텀 시트 최적화, 자연스러운 스와이프 제스처 |
| 차트 | Recharts 3 | 도넛/라인/바 차트 커스텀 렌더링, SVG 기반 |
| 폼 | React Hook Form + Zod v4 | 비제어 컴포넌트 기반 성능 최적화, 스키마 기반 검증 |
| 드래그 정렬 | dnd-kit | 접근성 지원, 터치 이벤트 호환 |
| 날짜 | date-fns 4 | 경량 날짜 유틸리티, Tree-shaking 지원 |
| 테마 | next-themes | SSR 환경에서 깜빡임 없는 다크 모드 전환 |

### Backend / Infra

| 분류 | 기술 | 선택 이유 |
|---|---|---|
| 인증 | Supabase Auth | 쿠키 기반 세션, `getClaims()`로 네트워크 없이 JWT 검증, Google/Kakao OAuth |
| 데이터베이스 | Supabase PostgreSQL | RLS로 행 단위 접근 제어, 트리거 기반 기본 데이터 자동 생성 |
| AI 이미지 인식 | Google Gemini 2.5 Flash | 영수증·결제 캡처 이미지에서 금액·상호명·날짜 추출 |
| 파일 처리 | xlsx | 브라우저/서버 양쪽에서 동작하는 엑셀 파싱·생성 |
| 푸시 알림 | Firebase Cloud Messaging (FCM) | Android WebView 앱과 연동한 네이티브 푸시 알림 |
| PWA | next-pwa | Workbox 기반 서비스 워커, 오프라인 캐싱 자동 설정 |

---

## 5. 아키텍처

```
┌────────────────────────────────────────────────────┐
│  proxy.ts (Middleware)                             │
│  → 모든 요청 인터셉트 → 세션 갱신 → 인증 게이트  │
└────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐   ┌─────────────────────────┐
│  Server Component   │   │  Client Component       │
│  Server Action      │   │  (useEffect, useState)  │
│  lib/supabase/      │   │  lib/supabase/          │
│  server.ts          │   │  client.ts              │
└─────────────────────┘   └─────────────────────────┘
           │                         │
           └──────────┬──────────────┘
                      ▼
             ┌────────────────┐
             │   Supabase     │
             │  PostgreSQL    │
             │  + Auth + RLS  │
             └────────────────┘
```

**RLS 정책:** 모든 테이블에 `user_id = auth.uid()` 적용 — 본인 데이터만 접근 가능.

### 인증 흐름

`proxy.ts`(미들웨어)가 모든 요청을 인터셉트하여 `lib/supabase/proxy.ts`의 `updateSession()`을 호출합니다.

```
요청 진입
   │
   ▼
proxy.ts → updateSession(request)
   │
   ├── getClaims() → JWT 디코딩 (네트워크 왕복 없음)
   │
   ├── 인증됨 + /auth/* 접근 → /ledger/daily 리다이렉트
   ├── 탈퇴 요청 계정 → /auth/account-recovery 리다이렉트
   ├── 미인증 + 보호 경로 접근 → /auth/login 리다이렉트
   └── 그 외 → 통과
```

> **주의:** 이 프로젝트의 미들웨어 파일명은 `middleware.ts`가 아닌 `proxy.ts`입니다.

### Android WebView 연동

```
Android Native App (money-logs-android)
   │
   ├── AndroidBridge.getFcmToken()  → FCM 토큰 → device_tokens 테이블 저장
   ├── AndroidBridge.getPlatform()  → 플랫폼 감지 (User-Agent: MoneyLogsApp/Android)
   │
   ├── Google OAuth
   │     └── Chrome Custom Tab → 콜백 → com.moneylogs.app://auth-callback
   │
   └── Kakao OAuth
         └── WebView 내 진행 → /auth/callback → 세션 설정
```

---

## 6. 구현 포인트

### Server Actions 기반 데이터 흐름

클라이언트에서 별도 API Route 없이 Server Actions로 직접 Supabase와 통신합니다. `revalidatePath()`로 데이터 변경 시 자동 캐시 무효화 처리.

```typescript
// lib/actions/transactions.ts
"use server";

export async function addTransaction(
  data: Omit<Transaction, "id"> & { recurringId?: string }
): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다");

  const { error } = await supabase.from("transactions").insert({
    user_id: authData.claims.sub,
    type: data.type,
    amount: data.amount,
    category_id: data.categoryId,
    asset_id: data.assetId,
    description: data.description ?? null,
    transaction_at: data.transactionAt,
    recurring_id: data.recurringId ?? null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/ledger");
}
```

### KST 기반 날짜 처리

서버(UTC)와 클라이언트(KST) 시간 불일치 문제를 월별 조회 쿼리에서 `KST_OFFSET`을 적용해 해결합니다.

```typescript
// lib/actions/transactions.ts
export async function getTransactionsByMonth(year: number, month: number) {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const start = new Date(Date.UTC(year, month - 1, 1) - KST_OFFSET).toISOString();
  const end   = new Date(Date.UTC(year, month,     1) - KST_OFFSET).toISOString();

  const { data } = await supabase
    .from("transactions")
    .select("...")
    .gte("transaction_at", start)
    .lt("transaction_at", end);
  // ...
}
```

### 신규 사용자 기본 데이터 자동 생성

Supabase DB 트리거(`create_default_data_for_user`)로 회원가입 시 기본 카테고리 8개·자산 3개를 자동 생성합니다. 별도 온보딩 API가 필요 없습니다.

```sql
-- supabase/migrations/20260305000000_init.sql
CREATE OR REPLACE FUNCTION create_default_data_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, color, is_default) VALUES
    (NEW.id, '식비',   'expense', '#EF4444', true),
    (NEW.id, '교통',   'expense', '#F97316', true),
    -- ...
    (NEW.id, '급여',   'income',  '#22C55E', true);

  INSERT INTO assets (user_id, name, type, is_default) VALUES
    (NEW.id, '현금', 'cash', true),
    (NEW.id, '은행', 'bank', true),
    (NEW.id, '카드', 'card', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 고정비 미처리 조회 로직

매월 처리해야 할 고정비 중 미등록·미건너뜀 항목만 필터링합니다.

```typescript
// lib/actions/recurring.ts
export async function getUnprocessedRecurring(year: number, month: number) {
  // 미래 달이면 빈 배열
  if (year > currentYear || (year === currentYear && month > currentMonth)) return [];

  // 당월이면 day_of_month <= 오늘, 과거달이면 제한 없음
  const maxDay = isCurrent ? currentDay : 31;

  // 이미 처리된 recurring_id (transactions 테이블)
  const { data: processed } = await supabase
    .from("transactions")
    .select("recurring_id")
    .gte("transaction_at", start).lt("transaction_at", end)
    .not("recurring_id", "is", null);

  // 건너뛴 recurring_id (recurring_skips 테이블)
  const { data: skipped } = await supabase
    .from("recurring_skips")
    .select("recurring_id")
    .eq("year", year).eq("month", month);

  const excludeIds = new Set([...processed, ...skipped].map(r => r.recurring_id));
  return all.filter(r => r.dayOfMonth <= maxDay && !excludeIds.has(r.id));
}
```

### 월별 트랜잭션 클라이언트 캐시

같은 달로 돌아올 때 서버 요청 없이 캐시를 재사용합니다.

```typescript
// components/ledger/LedgerTabView.tsx
const txCacheRef = useRef<Map<string, Transaction[]>>(new Map());

const loadData = async (date: Date) => {
  const key = format(date, "yyyy-MM");
  const cached = txCacheRef.current.get(key);

  if (cached) {
    setTransactions(cached); // 서버 요청 생략
  } else {
    const txs = await getTransactionsByMonth(year, month);
    txCacheRef.current.set(key, txs);
    setTransactions(txs);
  }
};
```

### 카테고리 상세 트렌드 — 8개월 단일 쿼리

현재 월 기준 과거 7개월치를 한 번의 쿼리로 조회 후 클라이언트에서 월별 집계합니다.

```typescript
// lib/actions/transactions.ts
export async function getMonthlyTrend(baseYear: number, baseMonth: number, count: number) {
  // start: count개월 전 1일 (KST→UTC)
  // end: baseMonth 다음 달 1일
  const { data } = await supabase
    .from("transactions")
    .select("amount, type, transaction_at, category_id")
    .gte("transaction_at", start)
    .lt("transaction_at", end);

  // 클라이언트에서 월별 집계
}
```

### FCM 푸시 알림 — Android 브릿지 연동

Android WebView에서 `AndroidBridge.getFcmToken()`을 호출해 토큰을 받아 Supabase `device_tokens` 테이블에 저장합니다. 이후 서버 스케줄러가 해당 토큰으로 푸시를 전송합니다.

```typescript
// components/PushNotificationInit.tsx
useEffect(() => {
  const isAndroid =
    typeof window !== "undefined" &&
    (window.__MONEYLOGS_ANDROID_APP__ ||
      navigator.userAgent.includes("MoneyLogsApp/Android"));

  if (!isAndroid || !window.AndroidBridge?.getFcmToken) return;

  const token = window.AndroidBridge.getFcmToken();
  if (token) {
    saveDeviceToken(token, "android"); // server action
  }
}, []);
```

### 계정 탈퇴 30일 유예 시스템

탈퇴 요청 시 즉시 삭제하지 않고 `user_deletion_requests` 테이블에 기록합니다. 미들웨어가 매 요청마다 유예 계정 여부를 감지하여 복구 페이지로 안내합니다.

```typescript
// lib/actions/account.ts
export async function requestAccountDeletion(): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다");

  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + 30); // 30일 후 삭제

  await supabase.from("user_deletion_requests").insert({
    user_id: authData.claims.sub,
    scheduled_deletion_at: scheduledAt.toISOString(),
  });
}
```

### 영수증 AI 스캔 — Gemini Vision + 접근 제어

영수증 또는 결제 캡처 이미지를 업로드하면 Gemini 2.5 Flash가 금액·상호명·날짜를 추출해 거래 추가 폼에 자동 입력합니다.

```
이미지 선택 (file input, accept="image/*")
   │
   ▼
compressImage() — Canvas API로 최대 1200px, JPEG 80% 압축
   │
   ▼
POST /api/analyze-receipt — base64 인코딩 후 서버 전송
   │
   ├── auth.getClaims() — 인증 확인
   ├── ADMIN_USER_ID 비교 — 관리자 여부
   └── receipt_scan_access 조회 — approved 여부 (서비스 롤 클라이언트)
   │
   ▼
Gemini 2.5 Flash (gemini-2.5-flash)
   └── JSON 응답: { amount, description, date, type }
   │
   ▼
폼 자동 입력 — setValue("amount"), setValue("description"), setValue("date")
```

접근 제어는 4단계로 구분됩니다:

| 상태 | UI |
|------|----|
| `admin` | 스캔 버튼 활성화 (항상 사용 가능) |
| `approved` | 스캔 버튼 활성화 |
| `none` | 버튼 클릭 시 승인 요청 툴팁 표시 |
| `pending` | 버튼 amber 색상으로 비활성화 |
| `denied` | 버튼 미표시 |

관리자(`ADMIN_USER_ID` 환경변수)는 설정 페이지의 전용 패널에서 요청 목록을 조회하고 승인/거부할 수 있습니다. 관리자 작업은 RLS를 우회하는 서비스 롤 클라이언트(`lib/supabase/admin.ts`)를 사용합니다.

```typescript
// app/api/analyze-receipt/route.ts
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    { inlineData: { mimeType, data: imageBase64 } },
    { text: prompt },
  ],
});
```

### 게스트 모드

미인증 사용자도 샘플 데이터로 앱을 미리 탐색할 수 있습니다. `GuestModeContext`를 통해 데이터 쓰기 시도 시 로그인 모달을 표시합니다.

```typescript
// lib/context/GuestModeContext.tsx
export function useGuestMode() {
  const { isGuest, requireAuth } = useContext(GuestModeContext);
  return { isGuest, requireAuth };
}

// 사용 예시
const { isGuest, requireAuth } = useGuestMode();
const handleAdd = () => {
  if (isGuest) return requireAuth(); // 로그인 모달 표시
  // 실제 데이터 저장 로직
};
```

---

## 7. 데이터베이스 스키마

### 테이블 구조

| 테이블 | 주요 컬럼 |
|--------|-----------|
| `categories` | `name`, `color`, `type` (income/expense), `sort_order`, `is_default`, `user_id` |
| `assets` | `name`, `type` (cash/bank/card/other), `sort_order`, `is_default`, `user_id` |
| `transactions` | `type`, `amount`, `category_id`, `asset_id`, `description`, `transaction_at`, `recurring_id`, `user_id` |
| `recurring_transactions` | `type`, `amount`, `category_id`, `asset_id`, `description`, `day_of_month`, `is_active`, `user_id` |
| `recurring_skips` | `recurring_id`, `year`, `month`, `user_id` |
| `notes` | `title`, `content`, `is_pinned`, `created_at`, `updated_at`, `user_id` |
| `device_tokens` | `token`, `platform`, `updated_at`, `user_id` |
| `notification_history` | `type`, `title`, `body`, `data`, `sent_at`, `user_id` |
| `user_deletion_requests` | `scheduled_deletion_at`, `created_at`, `user_id` |
| `receipt_scan_access` | `status` (pending/approved/denied), `email`, `requested_at`, `reviewed_at`, `user_id` |

### 관계도

```
auth.users
    │
    ├── categories (1:N)
    ├── assets (1:N)
    ├── notes (1:N)
    ├── device_tokens (1:N)
    ├── notification_history (1:N)
    ├── user_deletion_requests (1:1)
    ├── receipt_scan_access (1:1)
    ├── recurring_transactions (1:N)
    │       │
    │       └── recurring_skips (1:N) — 특정 달 건너뜀 기록
    └── transactions (1:N)
            ├── category_id → categories
            ├── asset_id    → assets
            └── recurring_id → recurring_transactions (nullable)
```

모든 테이블에 Row Level Security 적용 — 사용자는 본인 데이터에만 접근 가능합니다.

---

## 8. 라우트 구조

```
app/
├── page.tsx                              # 스플래시 (자동 리다이렉트)
├── privacy/                              # 개인정보처리방침 (공개)
├── terms/                                # 이용약관 (공개)
├── delete-account/                       # 계정 삭제 안내 (공개)
├── auth/
│   ├── login/                            # 로그인 (Google·Kakao 소셜 포함)
│   ├── sign-up/                          # 회원가입
│   ├── sign-up-success/                  # 가입 완료 안내
│   ├── forgot-password/                  # 비밀번호 찾기
│   ├── update-password/                  # 비밀번호 변경
│   ├── confirm/route.ts                  # 이메일 OTP 확인
│   ├── callback/route.ts                 # OAuth 콜백
│   ├── set-session/                      # Android WebView 세션 설정
│   ├── error/                            # 인증 오류
│   └── account-recovery/                 # 탈퇴 유예 계정 복구
└── (protected)/                          # 인증 필요 (GuestModeProvider 적용)
    ├── ledger/
    │   ├── daily/                        # 일별 가계부 + 검색 + 고정비 배너
    │   └── calendar/                     # 달력 뷰
    ├── statistics/
    │   ├── page.tsx                      # 통계 (도넛 차트 + 월별 추이)
    │   ├── category/[id]/                # 카테고리별 8개월 트렌드
    │   └── report/[year]/[month]/        # 월별 상세 리포트
    ├── notes/
    │   ├── page.tsx                      # 메모 목록
    │   └── [id]/                         # 메모 상세 (전체화면 편집기)
    └── settings/
        ├── page.tsx                      # 설정 메인 (테마·백업·내보내기·탈퇴)
        ├── categories/                   # 카테고리 관리
        ├── assets/                       # 자산 관리
        ├── recurring/                    # 고정비 관리
        ├── reports/                      # 월별 리포트 목록
        └── notifications/                # 알림 히스토리

app/api/
├── analyze-receipt/route.ts              # 영수증 이미지 AI 분석 (POST, 인증 + 접근 권한 필수)
├── backup/route.ts                       # 전체 데이터 JSON 백업 (GET)
├── export/transactions/route.ts          # 거래 엑셀 내보내기 (GET)
└── import/transactions/route.ts          # 거래 엑셀 가져오기 (POST)
```

---

## 9. 시작하기

### 사전 요구사항

- Node.js 18 이상
- [Supabase](https://supabase.com) 계정 및 프로젝트

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd household-book-app

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

`.env.local`에 Supabase 프로젝트 정보를 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-or-anon-key>

# 영수증 스캔 기능 (선택)
GOOGLE_GENERATIVE_AI_API_KEY=<gemini-api-key>
ADMIN_USER_ID=<supabase-user-uuid>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> - Supabase 키: 대시보드 → Project Settings → API
> - Gemini API 키: [Google AI Studio](https://aistudio.google.com) 에서 발급
> - `ADMIN_USER_ID`: Supabase Auth → Users 에서 관리자 계정의 UUID
> - `SUPABASE_SERVICE_ROLE_KEY`: Supabase → API → service_role 키 (서버 사이드 전용, 노출 금지)

### 데이터베이스 마이그레이션

```bash
# supabase/migrations/ 내 SQL 파일을 순서대로 Supabase SQL Editor에서 실행
# 1. 20260305000000_init.sql
# 2. 20260316_add_recurring_transactions.sql
# 3. 20260324_add_deletion_requests.sql
# 4. 20260327_add_monthly_trend_rpc.sql
# 5. 20260329_add_monthly_summary_logs.sql
# 6. 20260329_add_push_notification_tables.sql
# 7. 20260330_add_notification_history.sql
# 8. 20260401_add_receipt_scan_access.sql
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

### 개발 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버
npm run lint         # ESLint 검사
npm run test         # Jest 테스트 실행
npm run test:watch   # 테스트 감시 모드
npm run test:coverage # 커버리지 리포트
```

---

<div align="center">

**Next.js · Supabase · TypeScript · Tailwind CSS · PWA · FCM**

</div>
