# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js + Supabase 기반의 가계부 앱. Next.js App Router와 Supabase 인증(쿠키 기반 세션)을 사용한다.

이 웹앱은 `/Users/seung-yongsin/Documents/Yong/money-logs-andorid` Android 프로젝트에서 WebView로 감싸져 네이티브 앱으로 제공된다.

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
```

## 코드 수정 후 검증 규칙

파일을 수정한 후에는 반드시 아래 순서로 검증한다:

1. `npm run lint` — lint 오류 확인 및 수정
2. `npm run build` — 빌드 성공 여부 확인

오류가 있으면 수정 후 다시 검증한다.

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
- `lib/supabase/proxy.ts`의 `updateSession()`이 인증 게이트 역할
- 인증 확인은 `supabase.auth.getUser()`로 수행 (액세스 토큰 만료 시 리프레시 토큰 자동 갱신)
- Server Action에서 사용자 확인은 `supabase.auth.getClaims()`로 수행 (`getUser()`보다 빠름, 네트워크 왕복 없음)
- 로그인 성공 후 `/ledger/daily`로 리다이렉트
- 인증된 사용자가 `/auth/*` 경로(계정복구 제외)에 접근하면 `/ledger/daily`로 리다이렉트
- 탈퇴 요청 계정 로그인 시 `/auth/account-recovery`로 리다이렉트
- OAuth 콜백 (`/auth/callback`): Android WebView는 `/auth/set-session`으로 세션 토큰 전달

### 라우트 구조

**공개 라우트:**
- `app/page.tsx` — 랜딩 페이지
- `app/privacy/` — 개인정보처리방침
- `app/terms/` — 이용약관
- `app/delete-account/` — 계정 삭제

**인증 관련 라우트 (`app/auth/`):**
- `login/` — 로그인
- `sign-up/` — 회원가입
- `forgot-password/` — 비밀번호 찾기
- `update-password/` — 비밀번호 변경
- `confirm/` — 이메일 OTP 확인 (route.ts)
- `callback/` — OAuth 콜백 (route.ts)
- `set-session/` — Android WebView용 세션 설정 (클라이언트 컴포넌트)
- `error/` — 인증 오류
- `sign-up-success/` — 회원가입 성공
- `account-recovery/` — 탈퇴 요청 계정 복구

**보호된 라우트 (인증 필요, `(protected)` 그룹):**
- `/ledger/daily` — 일별 거래 보기
- `/ledger/calendar` — 캘린더 뷰
- `/notes`, `/notes/[id]` — 메모
- `/settings` — 설정 메인
- `/settings/categories` — 카테고리 관리
- `/settings/assets` — 자산 관리
- `/settings/recurring` — 고정비 관리
- `/statistics` — 통계
- `/statistics/category/[categoryId]` — 카테고리별 통계

**API 라우트 (`app/api/`):**
- `/api/backup` — 전체 데이터 JSON 백업 (GET, 인증 필수)
- `/api/export/transactions` — 거래 데이터 CSV 내보내기 (GET)
- `/api/import/transactions` — 거래 데이터 가져오기 (POST)

### lib/ 디렉토리 구조

```
lib/
├── actions/
│   ├── transactions.ts   # 거래 CRUD, 월별 조회, 통계
│   ├── categories.ts     # 카테고리 CRUD, 순서 변경
│   ├── assets.ts         # 자산 CRUD, 순서 변경
│   ├── recurring.ts      # 고정비 CRUD
│   ├── notes.ts          # 메모 CRUD
│   └── account.ts        # 계정 삭제/복구
├── supabase/
│   ├── client.ts         # 클라이언트 환경용 (sync)
│   ├── server.ts         # 서버 환경용 (async)
│   └── proxy.ts          # 미들웨어: 세션 갱신 + 인증 게이트
├── context/
│   └── GuestModeContext.tsx  # 게스트 모드 Context
├── mock/
│   ├── types.ts          # 앱 타입 정의 (Category, Asset, Transaction 등)
│   ├── data.ts           # 초기 데이터
│   └── guestData.ts      # 게스트용 Mock 데이터
├── utils/
│   └── imageUtils.ts     # 이미지 처리 유틸
├── utils.ts              # cn(), hasEnvVars
└── auth-errors.ts        # Supabase 에러 한국어 번역
```

### Server Action 패턴

```typescript
"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 동일 요청 내 중복 호출 제거 시 cache() 사용
export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다");
  const userId = authData.claims.sub as string;
  // ...
});

// 병렬 데이터 로딩
const [transactions, categories, assets] = await Promise.all([
  getTransactionsByMonth(year, month),
  getCategories(),
  getAssets(),
]);
```

### UI 컴포넌트

- shadcn/ui 컴포넌트는 `components/ui/`에 위치
- Drawer/Sheet: `vaul` 라이브러리 사용
- 차트: `recharts` 사용
- 드래그앤드롭: `@dnd-kit` 사용
- 공통 유틸리티: `lib/utils.ts`의 `cn()` (clsx + tailwind-merge)
- `lib/utils.ts`의 `hasEnvVars`로 환경 변수 설정 여부 확인 가능
- `next.config.ts`에 `cacheComponents: true` 설정됨 (Fluid compute용)

### Zod v4 + React Hook Form 패턴

```typescript
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const schema = z.object({
  // z.number()에서 invalid_type_error 대신 message 사용 (Zod v4)
  amount: z.number({ message: "금액을 입력하세요" }).min(1, "금액을 입력하세요"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(schema),
});

// number 입력 필드는 valueAsNumber 옵션 사용
<input type="number" {...register("amount", { valueAsNumber: true })} />
```

> Zod v4 주의: `z.number({ invalid_type_error: "..." })` 대신 `z.number({ message: "..." })` 사용.
