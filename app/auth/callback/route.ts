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
        const setSessionUrl = `/auth/set-session?${params.toString()}`;
        // WebView일 경우: AndroidBridge 감지 후 set-session으로 직접 이동
        // Chrome(외부 브라우저)일 경우: intent:// 버튼 표시 (사용자 클릭 필요)
        const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>로그인 완료</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f1117;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px}
  .card{width:100%;max-width:360px;text-align:center}
  .icon{width:64px;height:64px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
  .icon svg{width:32px;height:32px}
  h1{font-size:22px;font-weight:700;margin-bottom:8px;letter-spacing:-0.3px}
  p{font-size:14px;color:#9ca3af;margin-bottom:32px;line-height:1.6}
  .btn{display:block;width:100%;padding:16px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:14px;font-size:16px;font-weight:600;letter-spacing:-0.2px;-webkit-tap-highlight-color:transparent;border:none;cursor:pointer}
  .btn:active{opacity:0.85}
  .hint{margin-top:16px;font-size:12px;color:#6b7280}
</style>
</head>
<body>
<div class="card">
  <div class="icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  </div>
  <h1>로그인 완료!</h1>
  <p id="msg">처리 중...</p>
  <a href="${intentUrl}" class="btn" id="btn" style="display:none">앱으로 돌아가기</a>
  <p class="hint" id="hint" style="display:none">버튼을 눌러도 앱이 열리지 않으면<br>앱을 직접 실행해주세요</p>
</div>
<script>
  // WebView 감지: AndroidBridge가 있으면 WebView 내부에서 실행 중
  if (window.AndroidBridge) {
    // WebView → set-session 페이지로 직접 이동하여 Supabase 세션 설정
    document.getElementById('msg').textContent = '앱으로 이동 중...';
    window.location.replace('${setSessionUrl}');
  } else {
    // Chrome(외부 브라우저) → intent URL 버튼 표시
    document.getElementById('msg').textContent = '아래 버튼을 눌러\\n가계부 앱으로 돌아가세요';
    document.getElementById('btn').style.display = 'block';
    document.getElementById('hint').style.display = 'block';
  }
</script>
</body>
</html>`;
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
