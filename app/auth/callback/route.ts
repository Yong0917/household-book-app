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
        // intent:// URL은 Chrome Custom Tab에서 확실하게 앱을 실행시킴
        // 커스텀 스킴(com.moneylogs.app://)은 Chrome 302 리다이렉트에서 무시될 수 있으므로
        // HTML 페이지에서 intent:// 링크로 앱을 열고, 자동으로도 시도함
        const intentUrl = `intent://done?next=${encodeURIComponent(next)}#Intent;scheme=com.moneylogs.app;package=com.moneylogs.app;end`;
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
