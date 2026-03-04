# Development Guidelines

## 프로젝트 개요

- **목적**: Next.js + Supabase 기반 가계부 앱
- **스택**: Next.js 15 (App Router), Supabase, TypeScript, Tailwind CSS v3, shadcn/ui
- **패키지 매니저**: npm

## 프로젝트 아키텍처

```
app/                    # Next.js App Router 페이지
  page.tsx              # 랜딩 페이지 (공개)
  layout.tsx            # 루트 레이아웃
  protected/            # 인증 필요 영역
    layout.tsx          # nav/footer 포함
    page.tsx
  auth/                 # 인증 관련 페이지
    login/, sign-up/, forgot-password/, update-password/, confirm/
components/             # React 컴포넌트
  ui/                   # shadcn/ui 컴포넌트 (자동 생성, 직접 수정 금지)
lib/
  supabase/
    client.ts           # 클라이언트 컴포넌트용 Supabase 클라이언트
    server.ts           # 서버 컴포넌트/Server Actions용 Supabase 클라이언트
    proxy.ts            # 세션 갱신 로직 (middleware에서 호출)
  utils.ts              # cn(), hasEnvVars
proxy.ts                # Next.js middleware 역할 (파일명 주의: middleware.ts 아님)
```

## Supabase 클라이언트 사용 규칙

- **서버 컴포넌트 / Server Actions**: `@/lib/supabase/server.ts`의 `createClient()` (async)
- **클라이언트 컴포넌트**: `@/lib/supabase/client.ts`의 `createClient()` (sync)
- **절대 금지**: Supabase 클라이언트를 모듈 레벨 전역 변수에 저장 → Fluid compute에서 세션 오류 발생
- **올바른 예**: 함수/컴포넌트 내부에서 매번 `createClient()` 호출
- **잘못된 예**: `const supabase = createClient()` 를 파일 최상단에 선언

## 인증 패턴 규칙

- 인증 확인은 항상 `supabase.auth.getClaims()` 사용 (`getUser()` 금지 — 느림)
- Server Component에서 인증 실패 시: `redirect("/auth/login")` 호출
- `proxy.ts`의 `updateSession()`은 수정 시 쿠키 처리 순서 유지 필수
- `createServerClient` 호출과 `getClaims()` 호출 사이에 코드 삽입 금지

### 접근 제어 구조

| 경로 | 인증 필요 |
|------|-----------|
| `/` | 불필요 |
| `/auth/**` | 불필요 |
| `/protected/**` | 필요 |
| 기타 모든 경로 | 필요 |

## UI 컴포넌트 규칙

- shadcn/ui 컴포넌트 추가: `npx shadcn@latest add <component>` 실행, `components/ui/`에 자동 생성
- `components/ui/` 파일은 shadcn CLI로 관리 — 직접 커스터마이징 시 재생성 시 덮어쓰임 주의
- 스타일 유틸리티: `cn()` from `@/lib/utils` (clsx + tailwind-merge)
- 아이콘: `lucide-react` 사용

## 환경 변수 규칙

- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 필수
- `hasEnvVars` (`lib/utils.ts`)로 환경 변수 존재 여부 확인 후 조건부 렌더링

## 파일 수정 시 동시 수정 규칙

- `proxy.ts` 수정 시 → `lib/supabase/proxy.ts`의 `updateSession()` 함께 검토
- 새 보호 경로 추가 시 → `lib/supabase/proxy.ts`의 리다이렉트 조건 검토
- shadcn 컴포넌트 추가 시 → `components.json` 자동 업데이트됨 (수동 수정 금지)

## 금지 사항

- `middleware.ts` 파일 생성 금지 — 이 프로젝트는 `proxy.ts`가 middleware 역할
- `getUser()` 사용 금지 — `getClaims()` 사용
- Supabase 클라이언트 전역 변수 저장 금지
- `components/ui/` 직접 수정 후 shadcn CLI 재실행 금지 (덮어쓰임)
- `proxy.ts`에서 `supabaseResponse` 객체를 새 `NextResponse`로 교체 금지 (쿠키 유실)
