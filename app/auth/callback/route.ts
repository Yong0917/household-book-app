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
        // Android Chrome Custom Tab: 세션 교환 완료 후 커스텀 스킴으로 앱에 복귀 신호 전달
        // Chrome은 커스텀 스킴을 처리 못해 OS에 넘기고, OS가 앱의 intent-filter로 라우팅함
        const appUrl = `com.moneylogs.app://done?next=${encodeURIComponent(next)}`;
        return new NextResponse(null, {
          status: 302,
          headers: { Location: appUrl },
        });
      }
      redirect(next);
    } else {
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  redirect(`/auth/error?error=No+code+provided`);
}
