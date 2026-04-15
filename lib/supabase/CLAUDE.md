# lib/supabase/

## 클라이언트 선택

| 파일 | 사용처 |
|------|--------|
| `server.ts` | Server Action, API 라우트, Server Component |
| `client.ts` | `"use client"` 컴포넌트 |
| `admin.ts` | RLS 우회 필요 시 (현재: `analyze-receipt`만) |
| `proxy.ts` | `middleware.ts`에서만 호출 |

## 주의사항

**Fluid compute — 전역 변수에 클라이언트 저장 금지.** 함수 내부에서 매번 생성해야 한다.

**`getClaims()` vs `getUser()` 선택:**
- Server Action → `getClaims()` (로컬 JWT 검사, 빠름)
- API 라우트, `proxy.ts` → `getUser()` (서버 검증 + 만료 토큰 자동 갱신)

> proxy.ts에서 `getClaims()` 쓰면 토큰 갱신 안 됨 → 앱 재시작 후 로그아웃 버그 발생

**`admin.ts`는 RLS를 완전히 우회한다.** 범위를 최소화할 것.

## 파일명 주의

`lib/supabase/proxy.ts`가 실제 미들웨어 로직을 담당한다. `middleware.ts`가 아님.
