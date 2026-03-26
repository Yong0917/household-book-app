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
        // Android Chrome Custom Tab → 앱 복귀
        // Chrome Custom Tab과 WebView는 쿠키 저장소가 별개이므로,
        // 세션 토큰을 intent URL로 전달하여 WebView에서 setSession() 호출
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token ?? "";
        const refreshToken = session?.refresh_token ?? "";
        const params = new URLSearchParams({
          next,
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        const intentUrl = `intent://done?${params.toString()}#Intent;scheme=com.moneylogs.app;package=com.moneylogs.app;end`;
        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#121317;color:#fff;font-family:sans-serif;text-align:center}
a{display:inline-block;margin-top:16px;padding:14px 32px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:12px;font-size:16px;font-weight:600}</style>
</head><body><div><p>로그인 완료!</p><a href="${intentUrl}">앱으로 돌아가기</a>
<script>window.location.href="${intentUrl}";</script></div></body></html>`;
        return new NextResponse(html, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      redirect(next);
    } else {
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  redirect(`/auth/error?error=No+code+provided`);
}
