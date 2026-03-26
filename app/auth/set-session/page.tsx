"use client";

// Android WebView용 세션 설정 페이지
// Chrome Custom Tab에서 얻은 토큰을 WebView의 Supabase 클라이언트에 설정
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function SetSessionInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const next = searchParams.get("next") || "/ledger/daily";

    if (!accessToken || !refreshToken) {
      router.replace("/auth/login");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          console.error("세션 설정 실패:", error.message);
          router.replace("/auth/login");
        } else {
          router.replace(next);
        }
      });
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-muted-foreground text-sm">로그인 처리 중...</p>
    </div>
  );
}

export default function SetSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p className="text-muted-foreground text-sm">로그인 처리 중...</p>
        </div>
      }
    >
      <SetSessionInner />
    </Suspense>
  );
}
