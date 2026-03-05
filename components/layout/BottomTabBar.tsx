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
      className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/96 backdrop-blur-md border-t border-border/50 flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ href, icon: Icon, label, match }) => {
        const isActive = pathname.startsWith(match);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
          >
            <div
              className={cn(
                "w-14 h-7 flex items-center justify-center rounded-full transition-all duration-200",
                isActive ? "bg-primary/10" : ""
              )}
            >
              <Icon
                className={cn(
                  "h-[19px] w-[19px] transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground/55"
                )}
                strokeWidth={isActive ? 2.4 : 1.7}
              />
            </div>
            <span
              className={cn(
                "text-[10.5px] transition-all duration-200 tracking-tight",
                isActive ? "text-primary font-bold" : "text-muted-foreground/55 font-medium"
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
