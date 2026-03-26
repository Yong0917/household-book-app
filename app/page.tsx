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
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <Image
          src="/icon-512.png"
          alt="머니로그"
          width={88}
          height={88}
          className="rounded-[22px] shadow-md"
          priority
        />
        <p className="text-lg font-semibold tracking-tight text-foreground">
          머니로그
        </p>
      </div>

      {/* 하단 점 로딩 인디케이터 */}
      <div className="absolute bottom-16 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}
