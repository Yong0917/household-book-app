# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js + Supabase 기반의 가계부 앱. Next.js App Router와 Supabase 인증(쿠키 기반 세션)을 사용한다.

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
```

## 환경 변수

`.env.local` 파일에 다음 변수가 필요하다:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## 아키텍처

### Supabase 클라이언트 패턴

- **서버 컴포넌트/Server Actions**: `@/lib/supabase/server.ts`의 `createClient()` 사용 (async)
- **클라이언트 컴포넌트**: `@/lib/supabase/client.ts`의 `createClient()` 사용 (sync)
- **세션 갱신**: `proxy.ts`에서 `lib/supabase/proxy.ts`의 `updateSession()`을 호출하여 모든 요청에서 세션 쿠키를 갱신한다

> 중요: Fluid compute 환경에서 Supabase 클라이언트를 전역 변수에 저장하지 말 것. 요청/함수마다 새로 생성해야 한다.

### 인증 흐름

- `proxy.ts`는 Next.js middleware 역할 (파일명이 middleware.ts가 아닌 proxy.ts임에 주의)
- `proxy.ts` → `lib/supabase/proxy.ts`의 `updateSession()`이 인증 게이트 역할
- 미인증 사용자는 `/auth/login`으로 리다이렉트 (`/`, `/auth/*` 경로 제외)
- 인증 확인은 `supabase.auth.getClaims()`로 수행 (`getUser()`보다 빠름, 네트워크 왕복 없음)
- 인증 성공 후 `/protected`로 리다이렉트
- Server Component에서도 `getClaims()`로 사용자 확인 후 미인증 시 `redirect("/auth/login")` 호출

### 라우트 구조

- `app/page.tsx` — 랜딩 페이지 (공개)
- `app/protected/` — 인증 필요 영역 (layout.tsx에 nav/footer 포함)
- `app/auth/login/`, `sign-up/`, `forgot-password/`, `update-password/`, `confirm/` — 인증 관련 페이지

### UI 컴포넌트

- shadcn/ui 컴포넌트는 `components/ui/`에 위치
- 공통 유틸리티: `lib/utils.ts`의 `cn()` (clsx + tailwind-merge)
- `lib/utils.ts`의 `hasEnvVars`로 환경 변수 설정 여부 확인 가능
- `next.config.ts`에 `cacheComponents: true` 설정됨 (Fluid compute용)
