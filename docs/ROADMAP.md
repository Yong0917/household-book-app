# 가계부 앱 (household-book-app) 개발 로드맵

> 마지막 업데이트: 2026-03-07
> 버전: v1.2

---

## 프로젝트 개요

Next.js 15 + Supabase 기반의 개인 가계부 앱 MVP. 사용자가 스마트폰으로 수입과 지출을 날짜별로 기록하고, 카테고리별 통계를 통해 소비 패턴을 파악할 수 있는 서비스. 인증 시스템은 이미 구현되어 있으며, 가계부 핵심 기능(거래 CRUD, 통계, 설정)을 이 로드맵에서 순차적으로 구현한다.

---

## 성공 지표 (KPI)

- 거래 등록에서 저장까지 3탭 이내로 완료 가능한 UX
- 모바일 화면(375px~430px) 기준 레이아웃 깨짐 없음
- Phase 1 종료 시: 모든 페이지 정적 화면 구현 완료 및 내비게이션 플로우 검증
- Phase 2 종료 시: Mock 데이터 기반 CRUD 인터랙션 전 항목 동작
- Phase 3 종료 시: Supabase 실제 데이터 연동, RLS 정책 적용, Vercel 배포

---

## 기술 스택

| 분류 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | 이미 설치됨 |
| UI | React 19 + TypeScript 5.x | 이미 설치됨 |
| 스타일링 | Tailwind CSS 3.4.x + shadcn/ui | 이미 설치됨 |
| 아이콘 | Lucide React ^0.511.0 | 이미 설치됨 |
| 바텀 시트 | vaul | 신규 설치 필요 |
| 차트 | Recharts | 신규 설치 필요 |
| 폼 | React Hook Form 7.x + Zod | 신규 설치 필요 |
| 날짜 처리 | date-fns | 신규 설치 필요 |
| 백엔드 | Supabase (Auth 완료, DB 미구현) | 이미 설치됨 |
| 배포 | Vercel | Phase 3에서 진행 |

---

## 개발 로드맵

### Phase 0: 환경 준비 및 기반 작업 (3일) ✅ 완료

**목표**: 추가 라이브러리 설치, 인증 리디렉션 수정, 공통 레이아웃 구조 확립
**완료 기준**: `npm run build` 통과, `/ledger/daily` 진입 시 인증 게이트 동작, 하단 탭 내비게이션 표시

#### 태스크

- [x] vaul, Recharts, React Hook Form, Zod, date-fns 설치 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `lib/supabase/proxy.ts` 인증 성공 후 리디렉션을 `/protected` → `/ledger/daily`로 변경 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `app/auth/login/` Server Action의 로그인 성공 리디렉션을 `/ledger/daily`로 변경 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] 인증 후 영역 공통 레이아웃 파일 생성 (`app/ledger/layout.tsx`, `app/statistics/layout.tsx`, `app/settings/layout.tsx`) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `components/layout/BottomTabBar.tsx` 하단 탭 내비게이션 컴포넌트 구현 (가계부/통계/설정 3탭, 활성 탭 강조, Mobile First) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🔴높음

---

### Phase 1: UI 프로토타입 (정적 화면 구현, 6일) ✅ 완료

**목표**: 실제 기능 없이 화면 구조와 내비게이션 플로우를 구현하여 사용자 경험을 사전 검증한다.
**완료 기준**: 모든 페이지가 정적으로 렌더링되고, 탭/버튼/바텀 시트 열기·닫기 등 기본 내비게이션이 동작함. 데이터는 하드코딩된 더미값(빈 배열 or 단순 상수)으로 표시.

#### 1-1. 가계부 일일 보기 정적 화면 (F001, F002, F003, F010)

- [x] `app/ledger/daily/page.tsx` 페이지 파일 생성 및 기본 레이아웃 구성 (헤더: 날짜 표시 + 이전/다음 날 이동 버튼 자리, 수입/지출/순합계 요약 영역 자리, 거래 목록 영역 자리, FAB [+] 버튼) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🔴높음
- [x] `components/ledger/TransactionItem.tsx` 거래 항목 카드 컴포넌트 구현 (카테고리 아이콘 자리, 분류명, 내용, 자산, 금액, 수입/지출 색상 구분) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `components/ledger/TransactionList.tsx` 거래 목록 컴포넌트 구현 (빈 상태 메시지 포함) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음

#### 1-2. 거래 등록/수정 바텀 시트 정적 화면 (F001, F002)

- [x] `components/ledger/TransactionSheet.tsx` vaul 기반 바텀 시트 컴포넌트 구현 — 수입/지출 유형 토글 탭, 금액 입력 필드, 카테고리 선택 영역 자리, 자산 선택 영역 자리, 날짜·시간 입력 자리, 메모 입력 자리, 저장 버튼. 등록/수정 모드 분기(수정 시 삭제 버튼 표시). 실제 저장 동작 없음 | 담당: 프론트엔드 | 예상: 1.5d | 우선순위: 🔴높음

#### 1-3. 달력 보기 정적 화면 (F001, F002, F004, F010)

- [x] `components/ledger/CalendarView.tsx` 달력 뷰 컴포넌트 구현 — date-fns로 월 그리드 생성, 날짜 셀에 수입(파란색)/지출(빨간색) 금액 표시 자리, 날짜 셀 탭 시 선택 강조 및 하단 목록 전환 자리, 월 이동 버튼 | 담당: 프론트엔드 | 예상: 1.5d | 우선순위: 🔴높음
- [x] `app/ledger/calendar/page.tsx` 달력 보기 페이지 파일 생성 및 CalendarView 조합 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음

#### 1-4. 통계 페이지 정적 화면 (F005, F006, F010)

- [x] `components/statistics/DonutChart.tsx` Recharts 도넛 차트 컴포넌트 구현 — 빈 상태/데이터 있을 때 두 가지 렌더링, 카테고리 목록(아이콘, 카테고리명, 금액, 비율%) 표시 자리 | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🟡중간
- [x] `app/statistics/income/page.tsx`, `app/statistics/expense/page.tsx` 수입/지출 통계 페이지 생성, 수입/지출 탭 전환, 월 이동 버튼, DonutChart 조합 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간

#### 1-5. 설정 및 하위 페이지 정적 화면 (F007, F008, F009)

- [x] `app/settings/page.tsx` 설정 허브 페이지 — 분류 관리/자산 관리 메뉴 항목, 로그아웃 버튼 자리 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [x] `components/settings/CategoryList.tsx` 카테고리 목록 컴포넌트 — 수입/지출 탭, 아이콘·이름·색상 표시, [+ 추가] 버튼 자리, 삭제 버튼 자리 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [x] `app/settings/categories/page.tsx` 분류 관리 페이지 생성 및 CategoryList 조합 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [x] `components/settings/AssetList.tsx` 자산 목록 컴포넌트 — 자산 유형 아이콘·이름·유형 표시, [+ 추가] 버튼 자리, 삭제 버튼 자리 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [x] `app/settings/assets/page.tsx` 자산 관리 페이지 생성 및 AssetList 조합 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간

---

### Phase 2: 더미 데이터 기반 개발 (Mock 데이터 + 상태 관리, 7일) ✅ 완료

**목표**: Mock 데이터를 활용해 API 연결 없이 화면 동작과 인터랙션을 구현하고 UX를 사전 검증한다.
**완료 기준**: Mock 데이터 기반으로 거래 CRUD, 날짜 이동, 달력 날짜 선택, 통계 차트, 카테고리/자산 CRUD 인터랙션이 모두 동작함. 실제 Supabase 호출 없음.

#### 2-1. Mock 데이터 및 타입 정의

- [x] `lib/mock/types.ts` 데이터 모델 TypeScript 타입 정의 — Transaction, Category, Asset, TransactionType('income'|'expense'), AssetType('cash'|'bank'|'card'|'other') | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `lib/mock/data.ts` Mock 데이터 파일 생성 — 기본 카테고리 프리셋(수입 5개, 지출 10개), 기본 자산 프리셋(현금/은행계좌/신용카드), 샘플 거래 10~15건(현재 월 기준, 여러 날짜 분산) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `lib/mock/context.tsx` MockProvider 및 useMock() 훅 구현 — 전역 상태 관리 (Context API) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음

#### 2-2. 가계부 일일 보기 인터랙션 (F001, F002, F003, F010)

- [x] `app/ledger/daily/page.tsx`에 useState로 현재 날짜 상태 관리, 이전/다음 날 이동 버튼 동작 구현 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] Mock 거래 데이터를 선택 날짜 기준으로 필터링하여 TransactionList에 렌더링, 수입/지출/순합계 계산 표시 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] FAB [+] 버튼 탭 → TransactionSheet 열기, 거래 항목 탭 → 수정 모드로 TransactionSheet 열기 동작 구현 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] TransactionSheet에서 React Hook Form + Zod 폼 검증 구현 — 필수 필드(금액, 카테고리, 자산, 날짜), 저장 시 Mock 상태 배열에 추가/수정, 삭제 버튼 동작 구현 | 담당: 프론트엔드 | 예상: 1.5d | 우선순위: 🔴높음

#### 2-3. 달력 보기 인터랙션 (F001, F002, F004, F010)

- [x] CalendarView에 월 이동 상태 관리, 날짜 셀 탭 시 선택 날짜 강조 및 하단 거래 목록 표시 동작 구현 | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🔴높음
- [x] Mock 거래 데이터 기반으로 각 날짜 셀에 수입(파란색)/지출(빨간색) 합계 금액 표시, 월간 수입/지출/순합계 계산 표시 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음

#### 2-4. 통계 페이지 인터랙션 (F005, F006, F010)

- [x] 수입/지출 탭 전환 상태 관리, 월 이동 동작, Mock 거래 데이터를 카테고리별로 집계하여 DonutChart에 데이터 전달 | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🟡중간
- [x] DonutChart 조각 탭 시 해당 카테고리 강조 인터랙션, 카테고리 목록 금액·비율 표시 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간

#### 2-5. 설정 페이지 인터랙션 (F007, F008)

- [x] 분류 관리 페이지: Mock 카테고리 상태 기반 CRUD — [+ 추가] 버튼으로 추가 모달 열기, 카테고리 이름·아이콘·색상 입력 후 저장, 카테고리 항목 탭으로 수정 모달, 커스텀 카테고리 삭제(기본 프리셋 삭제 불가) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🟡중간
- [x] 자산 관리 페이지: Mock 자산 상태 기반 CRUD — [+ 추가] 버튼으로 추가 모달 열기, 자산 이름·유형·아이콘·색상 입력 후 저장, 자산 항목 탭으로 수정 모달, 커스텀 자산 삭제(기본 프리셋 삭제 불가) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🟡중간
- [x] 설정 페이지 로그아웃 버튼 연결 (supabase.auth.signOut() 후 /auth/login 리다이렉트) | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🟡중간

---

### Phase 3: 백엔드 연동 (Supabase 실제 연동, 8일) ✅ 완료

**목표**: 검증된 UI/UX를 기반으로 Supabase DB 스키마 생성, Server Actions 구현, 실제 데이터를 연동한다.
**완료 기준**: 모든 CRUD가 Supabase에 실제 저장·조회되고, RLS 정책이 적용되어 타 사용자 데이터에 접근 불가. 배포 환경에서 동작 확인.

#### 3-1. Supabase 스키마 및 초기 데이터

- [x] Supabase 대시보드에서 `profiles` 테이블 생성 — id (UUID, auth.users 참조), display_name (TEXT), created_at (TIMESTAMPTZ) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `categories` 테이블 생성 — id, user_id (auth.users 참조), name, type ('income'|'expense'), icon (lucide-react 아이콘명), color (hex), is_default (BOOLEAN), sort_order (INT), created_at | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `assets` 테이블 생성 — id, user_id, name, type ('cash'|'bank'|'card'|'other'), icon, color, is_default (BOOLEAN), sort_order (INT), created_at | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `transactions` 테이블 생성 — id, user_id, type, amount (BIGINT, 양수), category_id (categories 참조), asset_id (assets 참조), description (TEXT, nullable), transaction_at (TIMESTAMPTZ), created_at, updated_at | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] 모든 테이블에 RLS 정책 적용 — SELECT/INSERT/UPDATE/DELETE 모두 `user_id = auth.uid()` 조건 | 담당: 백엔드 | 예상: 1d | 우선순위: 🔴높음
- [x] 신규 회원가입 시 기본 카테고리/자산 프리셋 자동 삽입하는 PostgreSQL 함수 및 트리거 생성 (`create_default_data_for_user` 트리거 — auth.users INSERT 시 실행) | 담당: 백엔드 | 예상: 1d | 우선순위: 🔴높음

#### 3-2. Server Actions 구현

- [x] `lib/actions/categories.ts` — 카테고리 목록 조회(type 필터), 카테고리 추가, 카테고리 수정, 카테고리 삭제(is_default 체크) Server Actions 구현 | 담당: 풀스택 | 예상: 1d | 우선순위: 🔴높음
- [x] `lib/actions/assets.ts` — 자산 목록 조회, 자산 추가, 자산 수정, 자산 삭제(is_default 체크) Server Actions 구현 | 담당: 풀스택 | 예상: 1d | 우선순위: 🔴높음
- [x] `lib/actions/transactions.ts` — 날짜별 거래 목록 조회, 월별 거래 목록 조회, 거래 추가, 거래 수정, 거래 삭제 Server Actions 구현 | 담당: 풀스택 | 예상: 1.5d | 우선순위: 🔴높음

#### 3-3. Mock 데이터를 실제 API로 교체

- [x] `app/ledger/daily/page.tsx`를 서버 컴포넌트로 전환, Server Actions로 날짜별 거래 조회 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `app/ledger/calendar/page.tsx`를 서버 컴포넌트로 전환, Server Actions로 월별 거래 조회 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `app/statistics/income/page.tsx`, `expense/page.tsx`를 서버 컴포넌트로 전환, 월별 거래 집계 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🟡중간
- [x] `app/settings/categories/page.tsx`, `assets/page.tsx` Supabase CRUD 연동 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🟡중간
- [x] TransactionSheet 폼 저장 버튼을 `lib/actions/transactions.ts` Server Actions에 연결 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음

#### 3-4. 배포

- [x] Vercel 프로젝트 연결 및 환경 변수 설정 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) | 담당: DevOps | 예상: 0.5d | 우선순위: 🟡중간
- [ ] 배포 후 인증 흐름, 거래 CRUD, RLS 정책 동작 검증 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🟡중간

---

## 리스크 및 완화 전략

| 리스크 | 영향도 | 발생 가능성 | 완화 전략 |
|--------|--------|-------------|-----------|
| vaul 바텀 시트와 모바일 뷰포트 높이 충돌 (iOS Safari 주소창 이슈) | 높음 | 중간 | `dvh` 단위 사용, vaul의 `snapPoints` 옵션 활용. Phase 1에서 조기 검증 |
| Recharts 도넛 차트 반응형 적용 어려움 | 중간 | 중간 | `ResponsiveContainer` 래퍼 사용, 컨테이너 너비 기준 고정 크기 |
| 카테고리 삭제 시 기존 거래의 category_id 참조 무결성 오류 | 높음 | 낮음 | DB에 `ON DELETE RESTRICT` 또는 `ON DELETE SET NULL` 정책 명시. 삭제 전 사용 여부 체크 로직 추가 |
| 신규 가입자 기본 프리셋 삽입 타이밍 이슈 | 중간 | 중간 | DB 트리거보다 서버 액션에서 최초 데이터 조회 시 프리셋 삽입 처리(디버깅 용이) |
| 달력 컴포넌트 직접 구현 시 date-fns 의존성 복잡도 증가 | 중간 | 낮음 | date-fns의 `startOfMonth`, `eachDayOfInterval`, `getDay` 등 유틸 함수로 로직 단순화. 별도 달력 라이브러리 도입은 의존성 증가로 지양 |
| 월 이동 시 서버 컴포넌트 re-fetch 방식 결정 | 중간 | 중간 | URL 쿼리 파라미터(`?year=2026&month=3`) 방식으로 서버 컴포넌트에서 날짜 파라미터 수신. Phase 2에서 패턴 확정 후 Phase 3에서 적용 |

---

## 기술적 의존성

```
Phase 0 (환경 준비)
  └─ Phase 1 (정적 UI) 진행 가능
        ├─ 1-1 가계부 일일 보기 정적 화면
        │     └─ 1-2 거래 바텀 시트 정적 화면  ─┐
        ├─ 1-3 달력 보기 정적 화면               ├─ Phase 2 (Mock 인터랙션)
        ├─ 1-4 통계 페이지 정적 화면             │     └─ Phase 3 (Supabase 연동)
        └─ 1-5 설정 페이지 정적 화면  ───────────┘

기능 간 의존성:
  - F001(거래 등록) 의존: F007(카테고리), F008(자산) 데이터 필요
  - F003(일일 보기), F004(달력 보기) 의존: F001 거래 데이터 필요
  - F005(수입 통계), F006(지출 통계) 의존: F001 거래 데이터 + F007 카테고리 데이터 필요
```

---

## 보류 사항 및 미결 질문

1. **월 이동 구현 방식**: 일일 보기에서 "이전/다음 날" 이동과 "이전/다음 달" 이동이 모두 필요한지, 또는 날 단위만 이동하는지 PRD에서 명확하지 않음. 현재 F010은 "이전/다음 달 이동 버튼"으로만 명시되어 있어, 일일 보기에서는 날 이동 + 달 이동 두 가지가 필요한지 확인 필요.

2. **카테고리/자산 아이콘 선택 UI**: PRD에서 lucide-react 아이콘명을 TEXT로 저장한다고 명시했으나, 등록/수정 모달에서 아이콘을 어떻게 선택하는지(드롭다운 목록? 아이콘 그리드 팝업?) UI 방식이 명시되지 않음.

3. **카테고리 삭제 시 기존 거래 처리**: 커스텀 카테고리를 삭제할 때 해당 카테고리로 등록된 기존 거래가 있으면 삭제를 막을 것인지, 카테고리만 삭제하고 거래는 유지(category_id를 NULL 또는 기타로 변경)할 것인지 결정 필요.

4. **자산 삭제 시 기존 거래 처리**: 위 카테고리 삭제와 동일한 문제. DB 외래키 정책과 UI 에러 처리 방식 결정 필요.

5. **달력 보기의 기본 진입 날짜**: 달력 보기 진입 시 기본으로 오늘 날짜가 선택된 상태인지, 아니면 선택 없이 월 전체만 표시하는지 명시 필요.

6. **재신청/중복 입력**: 같은 날짜·금액·카테고리 거래를 중복 등록할 때 허용 여부. MVP에서는 별도 중복 체크 없이 허용하는 것으로 가정.

7. **profiles 테이블 활용 시점**: `display_name`을 어떤 화면에서 표시하는지 PRD에 언급이 없음. 현재 설정 페이지에 프로필 정보 표시 기능이 없으므로 Phase 3 이후로 미룸.

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| v1.0 | 2026-03-04 | 최초 작성 — PRD v1 기반, Phase 0~3 로드맵 수립 |
| v1.1 | 2026-03-05 | Phase 0, 1, 2 완료 상태 반영 — 체크박스 및 섹션 헤더 업데이트 |
| v1.2 | 2026-03-07 | Phase 3 완료 상태 반영 — DB 스키마, Server Actions, API 연동, 환경 변수 설정 완료 체크 |
