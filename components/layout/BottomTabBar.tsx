"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/ledger/daily", icon: BookOpen, label: "가계부", match: "/ledger" },
  { href: "/statistics", icon: BarChart2, label: "통계", match: "/statistics" },
  { href: "/settings", icon: Settings, label: "설정", match: "/settings" },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-sm border-t border-border/60 flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ href, icon: Icon, label, match }) => {
        const isActive = pathname.startsWith(match);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2"
          >
            <div
              className={cn(
                "w-11 h-7 flex items-center justify-center rounded-full transition-all duration-200",
                isActive ? "bg-primary/8" : ""
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground/70"
                )}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </div>
            <span
              className={cn(
                "text-[10px] tracking-tight transition-colors duration-200",
                isActive ? "text-primary font-semibold" : "text-muted-foreground/70"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
