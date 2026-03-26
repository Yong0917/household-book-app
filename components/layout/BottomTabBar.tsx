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
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/97 backdrop-blur-xl border-t border-border/40 flex items-stretch"
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
            <div
              className={cn(
                "w-12 h-6 flex items-center justify-center rounded-full transition-all duration-200",
                isActive ? "bg-primary/8" : ""
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground/45",
                  isPending && "animate-pulse"
                )}
                strokeWidth={isActive ? 2.3 : 1.6}
              />
            </div>
            <span
              className={cn(
                "text-[10px] transition-all duration-200 tracking-tight",
                isActive ? "text-primary font-bold" : "text-muted-foreground/45 font-medium"
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
