// OAuth 소셜 로그인 콜백 핸들러
// Google, Kakao 등 OAuth 제공자가 code를 이 URL로 전달함
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/ledger/daily";
  const isAndroid = searchParams.get("android") === "1";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (isAndroid) {
        // Android Auth Tab/WebView 플로우:
        // 앱이 받은 code를 WebView의 이 콜백으로 넘기면,
        // 세션 토큰을 /auth/set-session 페이지로 전달하여 WebView에서 setSession() 호출
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token ?? "";
        const refreshToken = session?.refresh_token ?? "";
        const params = new URLSearchParams({
          next,
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        const setSessionUrl = `/auth/set-session?${params.toString()}`;
        return NextResponse.redirect(new URL(setSessionUrl, request.url));
      }
      redirect(next);
    } else {
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  redirect(`/auth/error?error=No+code+provided`);
}
