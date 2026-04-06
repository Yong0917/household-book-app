"use client";

import { usePathname, useRouter } from "next/navigation";
import { BookOpen, BarChart2, Settings, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const tabs = [
  { href: "/ledger/daily", icon: BookOpen, label: "가계부", match: "/ledger" },
  { href: "/statistics", icon: BarChart2, label: "통계", match: "/statistics" },
  { href: "/notes", icon: StickyNote, label: "메모", match: "/notes" },
  { href: "/settings", icon: Settings, label: "설정", match: "/settings" },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // 마운트 시 모든 탭 라우트 프리패치 → 탭 전환 즉각적으로
  useEffect(() => {
    tabs.forEach(({ href }) => router.prefetch(href));
  }, [router]);

  // 페이지 이동 완료되면 로딩 상태 해제
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleTabClick = (href: string, match: string) => {
    // 이미 현재 탭이면 무시
    if (pathname.startsWith(match)) return;
    setPendingHref(href);
    router.push(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 flex items-stretch shadow-[0_-1px_12px_hsl(var(--border)/0.5)]"
      style={{
        height: "calc(4rem + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {tabs.map(({ href, icon: Icon, label, match }) => {
        const isActive = pathname.startsWith(match);
        const isPending = pendingHref === href;

        return (
          <button
            key={href}
            onClick={() => handleTabClick(href, match)}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
          >
            {/* 액티브 탭: 하늘파랑 pill 캡슐 배경 + 흰색 아이콘 */}
            <div
              className={cn(
                "w-12 h-7 flex items-center justify-center rounded-full transition-all duration-200",
                isActive
                  ? "bg-primary"
                  : "bg-transparent"
              )}
            >
              <Icon
                className={cn(
                  "transition-all duration-200",
                  isActive
                    ? "h-[17px] w-[17px] text-primary-foreground"
                    : "h-[17px] w-[17px] text-muted-foreground/50",
                  isPending && "animate-pulse"
                )}
                strokeWidth={isActive ? 2.4 : 1.7}
              />
            </div>
            {/* 액티브 탭: 하늘파랑 라벨 / 비액티브: muted 라벨 */}
            <span
              className={cn(
                "text-[10px] font-semibold transition-all duration-200 tracking-tight",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground/50"
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
