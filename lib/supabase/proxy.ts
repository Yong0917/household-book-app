import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 홈(`/`)은 서버 컴포넌트에서 getSession()으로 목적지를 결정하고,
  // 보호 경로 진입 시 미들웨어/서버 컴포넌트가 다시 getUser()로 검증·갱신한다.
  // 홈에서는 getUser() 라운드트립을 스킵해 Android WebView 첫 진입 TTFB를 단축.
  const pathname = request.nextUrl.pathname;
  if (pathname === "/") {
    return supabaseResponse;
  }

  // Do not run code between createServerClient and the auth check below.
  // A simple mistake could make it very hard to debug issues with users
  // being randomly logged out.

  // 1) getClaims()는 ES256 비대칭 서명키 환경에서 캐시된 JWKS로 JWT를 로컬 검증한다
  //    (네트워크 왕복 없음). 매 보호 경로 요청·Server Action마다 발생하던 Auth 서버
  //    왕복을 제거해 TTFB를 단축한다.
  // 2) 단, getClaims()는 만료된 토큰을 갱신하지 않는다. 클레임이 없거나(만료/무효)
  //    만료가 임박한 경우에만 getUser()를 호출해 리프레시 토큰으로 세션을 갱신한다
  //    (앱 재시작 후 로그아웃 버그 방지). 토큰이 충분히 유효하면 왕복을 스킵한다.
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  const REFRESH_THRESHOLD_SEC = 600; // 만료 10분 전부터 미리 갱신
  const nowSec = Math.floor(Date.now() / 1000);
  const exp = typeof claims?.exp === "number" ? claims.exp : 0;
  const needsRefresh = !claims || exp - nowSec < REFRESH_THRESHOLD_SEC;

  let isAuthenticated = !!claims;
  if (needsRefresh) {
    const { data: { user } } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  }

  if (
    isAuthenticated &&
    pathname.startsWith("/auth") &&
    pathname !== "/auth/account-recovery"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/ledger/daily";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
