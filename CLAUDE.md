# CLAUDE.md

## 프로젝트 개요

Next.js + Supabase 가계부 앱. Android WebView(`money-logs-android`)에 감싸져 네이티브 앱으로 제공된다.

## 개발 명령어

```bash
npm run dev    # localhost:3000
npm run lint   # 수정 후 반드시 실행
npm run build  # lint 통과 후 반드시 실행
```

## 환경 변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # 서버 전용, 클라이언트 노출 금지
GOOGLE_GENERATIVE_AI_API_KEY=
ADMIN_USER_ID=               # 관리자 사용자 UUID
```

## 아키텍처

세부 패턴은 각 디렉토리의 CLAUDE.md 참고:
- `lib/supabase/` — 클라이언트 선택, 인증 방식
- `lib/actions/` — Server Action 패턴
- `app/api/` — API 라우트 패턴
- `components/` — UI 컴포넌트 패턴

## 인증 흐름 (주요 리다이렉트)

- 로그인 성공 → `/ledger/daily`
- 인증된 사용자가 `/auth/*` 접근 → `/ledger/daily` (account-recovery 제외)
- 탈퇴 요청 계정 → `/auth/account-recovery`
- OAuth 콜백: Android WebView는 `/auth/set-session`으로 토큰 전달

## 라우트 구조

```
app/
├── (protected)/          # 인증 필요
│   ├── ledger/daily, calendar
│   ├── notes/, notes/[id]
│   ├── settings/, settings/categories, assets, recurring
│   └── statistics/, statistics/category/[categoryId], report/[year]/[month]
├── auth/                 # 공개
│   ├── login, sign-up, forgot-password, update-password
│   ├── confirm/route.ts, callback/route.ts
│   └── set-session, error, sign-up-success, account-recovery
├── api/
│   ├── analyze-receipt   # POST — Gemini 영수증 분석
│   ├── backup            # GET  — JSON 백업
│   ├── export/transactions # GET — Excel 내보내기
│   └── import/transactions # POST — Excel 가져오기
└── privacy, terms, delete-account
```
