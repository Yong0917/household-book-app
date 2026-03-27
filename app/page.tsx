"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/ledger/daily");
      } else {
        router.replace("/auth/login");
      }
    });
  }, [router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap');

        @keyframes splashIconIn {
          0%   { opacity: 0; transform: scale(0.72) translateY(8px); filter: blur(6px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);   filter: blur(0); }
        }

        @keyframes splashFadeUp {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes splashLoaderIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes shimmerSlide {
          0%   { left: -40%; }
          100% { left: 120%; }
        }

        @keyframes orbDrift {
          0%, 100% { opacity: 0.18; transform: scale(1) translate(0, 0); }
          50%       { opacity: 0.26; transform: scale(1.06) translate(4px, -6px); }
        }

        .splash-icon     { animation: splashIconIn  0.72s cubic-bezier(0.34, 1.45, 0.64, 1) 0.05s both; }
        .splash-name     { animation: splashFadeUp  0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both; }
        .splash-tagline  { animation: splashFadeUp  0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.46s both; }
        .splash-loader   { animation: splashLoaderIn 0.4s ease 0.68s both; }

        .shimmer {
          animation: shimmerSlide 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .orb-1 { animation: orbDrift 6s ease-in-out infinite; }
        .orb-2 { animation: orbDrift 8s ease-in-out 2s infinite; }
      `}</style>

      <div
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#FAF8F3" }}
      >
        {/* 배경 orb — 따뜻한 안개 느낌 */}
        <div
          className="orb-1 pointer-events-none absolute rounded-full"
          style={{
            width: "72vw",
            height: "72vw",
            top: "-18vw",
            right: "-18vw",
            background:
              "radial-gradient(circle, rgba(196,152,90,0.22) 0%, transparent 68%)",
            filter: "blur(2px)",
          }}
        />
        <div
          className="orb-2 pointer-events-none absolute rounded-full"
          style={{
            width: "56vw",
            height: "56vw",
            bottom: "-8vw",
            left: "-12vw",
            background:
              "radial-gradient(circle, rgba(110,150,170,0.14) 0%, transparent 68%)",
            filter: "blur(2px)",
          }}
        />

        {/* 중앙 콘텐츠 */}
        <div className="relative z-10 flex flex-col items-center gap-7">
          {/* 아이콘 + 레이어 그림자 */}
          <div className="splash-icon relative">
            {/* 가장 먼 그림자 (블러) */}
            <div
              className="pointer-events-none absolute"
              style={{
                inset: "-16px",
                borderRadius: "38px",
                background:
                  "radial-gradient(circle, rgba(160,120,70,0.18) 0%, transparent 72%)",
                filter: "blur(18px)",
              }}
            />
            {/* 가까운 그림자 (선명) */}
            <div
              className="pointer-events-none absolute"
              style={{
                inset: 0,
                borderRadius: "24px",
                boxShadow:
                  "0 12px 36px rgba(100,70,30,0.14), 0 3px 10px rgba(100,70,30,0.10)",
              }}
            />
            <Image
              src="/icon-512.png"
              alt="머니로그"
              width={96}
              height={96}
              priority
              style={{ borderRadius: "22px", position: "relative", display: "block" }}
            />
          </div>

          {/* 텍스트 그룹 */}
          <div className="flex flex-col items-center gap-2">
            <h1
              className="splash-name font-bold"
              style={{
                fontFamily: "'Gowun Batang', Georgia, serif",
                fontSize: "26px",
                color: "#1C1714",
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              머니로그
            </h1>
            <p
              className="splash-tagline tracking-[0.18em] uppercase"
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#B8A898",
                letterSpacing: "0.18em",
              }}
            >
              나의 하루 기록
            </p>
          </div>
        </div>

        {/* shimmer 로딩 바 */}
        <div className="splash-loader absolute bottom-[68px] flex flex-col items-center">
          <div
            className="relative overflow-hidden rounded-full"
            style={{
              width: "52px",
              height: "2px",
              background: "rgba(180,155,120,0.22)",
            }}
          >
            <div
              className="shimmer absolute top-0 h-full rounded-full"
              style={{
                width: "35%",
                background:
                  "linear-gradient(90deg, transparent, rgba(160,120,70,0.75), transparent)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
