# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

MoneyLog — Next.js 15 App Router + Supabase 기반 개인 가계부 PWA. Android WebView로 래핑한 네이티브 앱(`money-logs-android`)과 연동한다.

## 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사
npm run test         # Jest 테스트
npm run test:watch   # 테스트 감시 모드
npm run test:coverage # 커버리지 리포트
```

테스트 파일은 `lib/utils/__tests__/` 패턴 또는 `*.test.ts` 파일로 작성한다.

## 아키텍처

```
middleware.ts → lib/supabase/proxy.ts (updateSession)
                      │
          ┌───────────┴───────────┐
   Server Component/Action    Client Component
   lib/supabase/server.ts     lib/supabase/client.ts
          │                         │
          └───────────┬─────────────┘
                 Supabase (PostgreSQL + Auth + RLS)
```

**라우트 구조:**
- `app/page.tsx` — 홈, 인증 여부에 따라 `/ledger/daily` 또는 `/auth/login`으로 즉시 리다이렉트
- `app/(protected)/` — 인증 필요. `GuestModeProvider`로 감싸며, 게스트도 접근 가능(샘플 데이터 표시)
- `app/auth/` — 인증 흐름 (로그인, 회원가입, OAuth 콜백, 비밀번호 재설정, 계정 복구)
- `app/api/` — 영수증 AI 분석, 엑셀 내보내기/가져오기, 전체 백업

## Supabase 클라이언트 선택 규칙

| 파일 | 사용처 |
|------|--------|
| `lib/supabase/server.ts` | Server Action, API 라우트, Server Component |
| `lib/supabase/client.ts` | `"use client"` 컴포넌트 |
| `lib/supabase/admin.ts` | RLS 우회 필요 시 (`analyze-receipt`만) |
| `lib/supabase/proxy.ts` | `middleware.ts`에서만 호출 |

**Fluid compute 주의:** 전역 변수에 Supabase 클라이언트를 저장하지 말 것. 함수 내부에서 매번 생성해야 한다.

**`getClaims()` vs `getUser()` 선택:**
- Server Action → `getClaims()` (로컬 JWT 검사, 빠름)
- API 라우트, `proxy.ts` → `getUser()` (서버 검증 + 만료 토큰 자동 갱신)

`proxy.ts`에서 `getClaims()` 쓰면 토큰 갱신 안 됨 → 앱 재시작 후 로그아웃 버그 발생.

홈(`app/page.tsx`)만 예외적으로 `getSession()` 사용 — 라운드트립 스킵으로 Android WebView 첫 진입 TTFB 단축. 보호 경로 진입 시 미들웨어 `getUser()`가 다시 검증한다.

## Server Action 패턴

모든 `lib/actions/` 파일 첫 줄에 `"use server"` 필수.

```typescript
const { data: authData } = await supabase.auth.getClaims();
if (!authData) throw new Error("인증이 필요합니다");
const userId = authData.claims.sub as string;
```

**`revalidatePath` 사용 경로:** `/settings/categories`, `/settings/assets`, `/settings/recurring`, `/notes`
`transactions.ts`는 revalidatePath 없음 — `LedgerTabView`가 직접 재fetch한다.

**`cache()` 적용 함수:** `getCategories`, `getAssets` — 동일 요청 내 중복 호출 제거용.

## 시간대 처리 (KST)

DB는 UTC 저장, 표시는 KST. `lib/utils/timezone.ts` 함수를 사용한다.

**핵심 규칙:** `utcIsoToKST()`와 `getNowKST()` 반환값은 반드시 `getUTCFullYear()`, `getUTCHours()` 등 **UTC 계열 메서드**로 읽는다. `getHours()` 쓰면 KST가 아닌 로컬 타임존 값이 나온다.

월 범위 쿼리는 `getMonthRangeUTC(year, month)`를 사용하면 KST 기준 정확한 UTC 범위를 반환한다.

## 게스트 모드

`GuestModeContext`로 비인증 사용자를 처리한다. 데이터 쓰기 시도 시:

```typescript
const { isGuest, requireLogin } = useGuestMode();
if (isGuest) return requireLogin(); // 로그인 유도 모달
```

게스트 데이터는 `lib/mock/guestData.ts`. Server Action 대신 mock 데이터를 쓴다.

## LedgerTabView 캐싱

SSR 초기 데이터 → 인메모리(`txCacheRef`) → localStorage(`ledger_cache_v1`, 최근 3개월) 순으로 탐색. 거래 변경 시 현재 달만 재fetch.

## Android WebView 연동

- 플랫폼 감지: `navigator.userAgent.includes("MoneyLogsApp/Android")` 또는 `window.__MONEYLOGS_ANDROID_APP__`
- FCM 토큰: `window.AndroidBridge?.getFcmToken()` → `device_tokens` 테이블
- Android 뒤로가기: Drawer/SearchView 열 때 `history.pushState()`로 히스토리 추가, `popstate`로 단계별 닫기

## API 라우트 주의사항

- 인증: `getUser()` 사용 (Server Action의 `getClaims()`와 다름)
- `analyze-receipt`: 접근 권한은 `ADMIN_USER_ID` 비교 또는 `receipt_scan_access.status = "approved"` 확인. 권한 확인 시 `createAdminClient()` 사용 (RLS 우회)
- Gemini 모델: `gemini-2.5-flash`, `@google/genai` SDK, 이미지는 `inlineData`(Base64)

## 영수증 스캔 접근 상태 (`AccessStatus`)

`admin` | `approved` → 활성, `pending` → 비활성(amber 버튼), `none` → 요청 버튼, `denied` → 숨김.

## 폼 관련

- Zod v4: `z.number({ message: "..." })` 사용. `invalid_type_error` 아님
- React Hook Form + Zod 조합 사용

## UI 라이브러리

- shadcn/ui (`components/ui/`) + Radix UI
- `vaul` — 바텀 시트(Drawer)
- `recharts` — 차트
- `@dnd-kit` — 드래그앤드롭 정렬
- `cn()` from `@/lib/utils` — 클래스 병합

## 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=   # 영수증 스캔 (선택)
ADMIN_USER_ID=                  # 관리자 Supabase user UUID
SUPABASE_SERVICE_ROLE_KEY=      # 서버 사이드 전용, 노출 금지
```

## 서브 CLAUDE.md 파일

세부 규칙은 각 디렉토리의 CLAUDE.md를 참조한다:
- `lib/supabase/CLAUDE.md` — 클라이언트 선택, Fluid compute 주의사항
- `lib/actions/CLAUDE.md` — Server Action 패턴, RPC 목록, 고정비 날짜 처리
- `components/CLAUDE.md` — UI 패턴, 캐싱 구조, Android 뒤로가기
- `app/api/CLAUDE.md` — API 라우트별 요점

## 코딩 가이드라인

1. **Think Before Coding** — 가정 명시. 불확실하면 질문. 여러 해석이 가능하면 제시.
2. **Simplicity First** — 요청된 것만. 추측성 추상화 금지. 200줄을 50줄로 쓸 수 있으면 쓴다.
3. **Surgical Changes** — 필요한 것만 수정. 관련 없는 코드는 건드리지 않는다.
4. **Goal-Driven** — 성공 기준을 정하고 검증한다.
