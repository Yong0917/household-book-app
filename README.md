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

모바일 퍼스트 디자인으로 스마트폰에서도 네이티브 앱처럼 편리하게 사용할 수 있으며, PWA를 통해 홈 화면에 추가하면 앱처럼 실행됩니다. 거래 기록부터 통계 시각화, 고정비 자동화, 고급 검색·필터, 엑셀 내보내기·가져오기까지 일상적인 가계 관리에 필요한 모든 기능을 담았습니다.

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
- **월 선택 피커** — 연·월 단위로 원하는 기간 통계 탐색

### 고정비 관리
- **고정비 등록** — 매월 반복되는 수입/지출을 결제일(1~31일)과 함께 등록
- **미처리 알림** — 결제일이 지난 미등록 고정비를 가계부 상단 배너로 안내
- **빠른 등록** — 배너 클릭 시 금액·카테고리·자산이 자동 채워진 시트 오픈
- **건너뛰기** — 특정 달에 등록하지 않을 항목은 건너뛰기로 배너에서 제거

### 데이터 관리
- **카테고리 관리** — 커스텀 카테고리 생성·수정·삭제, 색상 팔레트, 드래그 앤 드롭 순서 변경
- **자산 관리** — 카드·현금·계좌 등 자산 등록·수정·삭제, 드래그 앤 드롭 순서 변경
- **엑셀 내보내기** — 거래 내역을 `.xlsx` 파일로 즉시 다운로드
- **엑셀 가져오기** — 엑셀 파일에서 거래 내역 일괄 임포트

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
| 차트 | Recharts | 도넛/라인 차트 커스텀 렌더링, SVG 기반 |
| 폼 | React Hook Form + Zod v4 | 비제어 컴포넌트 기반 성능 최적화, 스키마 기반 검증 |
| 드래그 정렬 | dnd-kit | 접근성 지원, 터치 이벤트 호환 |
| 날짜 | date-fns | 경량 날짜 유틸리티, Tree-shaking 지원 |
| 테마 | next-themes | SSR 환경에서 깜빡임 없는 다크 모드 전환 |

### Backend / Infra

| 분류 | 기술 | 선택 이유 |
|---|---|---|
| 인증 | Supabase Auth | 쿠키 기반 세션, `getClaims()`로 네트워크 없이 JWT 검증 |
| 데이터베이스 | Supabase PostgreSQL | RLS로 행 단위 접근 제어, 트리거 기반 기본 데이터 자동 생성 |
| 파일 처리 | xlsx | 브라우저/서버 양쪽에서 동작하는 엑셀 파싱·생성 |
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
   ├── 미인증 + 보호 경로 접근 → /auth/login 리다이렉트
   └── 그 외 → 통과
```

> **주의:** 이 프로젝트의 미들웨어 파일명은 `middleware.ts`가 아닌 `proxy.ts`입니다.

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다");

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
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

### 관계도

```
auth.users
    │
    ├── categories (1:N)
    ├── assets (1:N)
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
├── page.tsx                          # 랜딩 (공개)
├── auth/
│   ├── login/                        # 로그인
│   ├── sign-up/                      # 회원가입
│   ├── sign-up-success/              # 가입 완료 안내
│   ├── forgot-password/              # 비밀번호 찾기
│   ├── update-password/              # 비밀번호 변경
│   └── confirm/route.ts             # 이메일 확인 처리
└── (인증 필요)
    ├── ledger/
    │   ├── daily/                    # 일별 가계부 + 검색 + 고정비 배너
    │   └── calendar/                 # 달력 뷰
    ├── statistics/
    │   ├── page.tsx                  # 통계 (도넛 차트 + 월별 추이)
    │   └── category/[id]/            # 카테고리별 트렌드 상세
    └── settings/
        ├── page.tsx                  # 설정 메인
        ├── categories/               # 카테고리 관리
        ├── assets/                   # 자산 관리
        └── recurring/                # 고정비 관리
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
```

> Supabase 대시보드 → Project Settings → API 에서 확인할 수 있습니다.
> `anon` 키와 새로운 `publishable` 키 모두 호환됩니다.

### 데이터베이스 마이그레이션

```bash
# supabase/migrations/ 내 SQL 파일을 순서대로 Supabase SQL Editor에서 실행
# 1. 20260305000000_init.sql
# 2. 20260316_add_recurring_transactions.sql
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

### 개발 명령어

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

---

<div align="center">

**Next.js · Supabase · TypeScript · Tailwind CSS · PWA**

</div>
