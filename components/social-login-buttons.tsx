"use client";

// 소셜 로그인 버튼 컴포넌트 (Google, Kakao)
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Provider } from "@supabase/supabase-js";

// 인앱 브라우저 감지 (카카오톡, 인스타그램, 네이버, 페이스북 등)
function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|Line\/|KAKAOTALK|NAVER|naver|DaumDevice|NaverApp|Twitter/i.test(ua);
}

// Android에서 Chrome으로 현재 페이지 열기 시도
function tryOpenInChrome(): boolean {
  if (!/Android/i.test(navigator.userAgent)) return false;
  const url = window.location.href;
  const host = url.replace(/^https?:\/\//, "");
  window.location.href = `intent://${host}#Intent;scheme=https;package=com.android.chrome;end`;
  return true;
}

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
  const [showInAppWarning, setShowInAppWarning] = useState(false);

  const handleSocialLogin = async (provider: Provider) => {
    // Google 로그인 시 인앱 브라우저 차단 처리
    if (provider === "google" && isInAppBrowser()) {
      // Android는 Chrome으로 리다이렉트 시도, iOS는 안내 메시지
      if (!tryOpenInChrome()) {
        setShowInAppWarning(true);
      }
      return;
    }

    const supabase = createClient();
    setLoadingProvider(provider);

    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

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
      {/* 인앱 브라우저 경고 */}
      {showInAppWarning && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-4 text-[13px] text-orange-700 dark:text-orange-400">
          <p className="font-semibold mb-1">외부 브라우저에서 열어주세요</p>
          <p className="text-[12px] leading-relaxed text-orange-600 dark:text-orange-500">
            현재 앱 내 브라우저에서는 Google 로그인이 지원되지 않습니다.
            화면 우측 상단 메뉴 → <strong>&apos;외부 브라우저로 열기&apos;</strong> 를 선택한 뒤 다시 시도해주세요.
          </p>
          <button
            type="button"
            onClick={() => setShowInAppWarning(false)}
            className="mt-2 text-[12px] underline"
          >
            닫기
          </button>
        </div>
      )}

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
