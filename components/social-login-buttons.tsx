"use client";

// 소셜 로그인 버튼 컴포넌트 (Google, Kakao)
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Provider } from "@supabase/supabase-js";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1C4.582 1 1 3.82 1 7.3c0 2.22 1.476 4.17 3.713 5.29l-.947 3.53c-.083.31.288.556.554.364L8.59 13.88c.135.01.272.016.41.016 4.418 0 8-2.82 8-6.3C17 4.82 13.418 1 9 1Z"
        fill="#000000"
      />
    </svg>
  );
}

interface SocialLoginButtonsProps {
  redirectTo?: string;
}

export function SocialLoginButtons({ redirectTo = "/ledger/daily" }: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handleSocialLogin = async (provider: Provider) => {
    const supabase = createClient();
    setLoadingProvider(provider);

    // Android WebView 감지: OAuth 완료 후 곧바로 앱 딥링크로 복귀
    // 앱이 받은 code를 WebView의 /auth/callback?android=1 로 넘겨 세션 교환 처리
    // 1차: AndroidBridge JS 인터페이스로 감지
    // 2차: User-Agent에 MoneyLogsApp 포함 여부로 폴백 감지
    const androidBridge = (window as unknown as { AndroidBridge?: { getPlatform?: () => string } }).AndroidBridge;
    const isAndroid = androidBridge?.getPlatform?.() === "android"
      || navigator.userAgent.includes("MoneyLogsApp/Android");
    const callbackUrl = isAndroid
      ? `com.moneylogs.app://auth-callback?next=${encodeURIComponent(redirectTo)}`
      : `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
      },
    });

    // OAuth는 페이지 이동이 발생하므로 setLoadingProvider(null) 불필요
  };

  return (
    <div className="space-y-3">
      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[12px] text-muted-foreground">또는</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Google 로그인 */}
      <button
        type="button"
        onClick={() => handleSocialLogin("google")}
        disabled={loadingProvider !== null}
        className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl border border-border bg-background text-[14.5px] font-medium text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingProvider === "google" ? (
          <span className="text-[13px] text-muted-foreground">연결 중...</span>
        ) : (
          <>
            <GoogleIcon />
            Google로 계속하기
          </>
        )}
      </button>

      {/* 카카오 로그인 */}
      <button
        type="button"
        onClick={() => handleSocialLogin("kakao")}
        disabled={loadingProvider !== null}
        className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl bg-[#FEE500] text-[14.5px] font-medium text-[#191919] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingProvider === "kakao" ? (
          <span className="text-[13px]">연결 중...</span>
        ) : (
          <>
            <KakaoIcon />
            카카오로 계속하기
          </>
        )}
      </button>
    </div>
  );
}
