"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/ledger/daily", icon: BookOpen, label: "가계부", match: "/ledger" },
  { href: "/statistics/income", icon: BarChart2, label: "통계", match: "/statistics" },
  { href: "/settings", icon: Settings, label: "설정", match: "/settings" },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t border-border flex items-center justify-around"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ href, icon: Icon, label, match }) => {
        const isActive = pathname.startsWith(match);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-4"
          >
            <Icon
              className={cn(
                "h-5 w-5",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "text-xs",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
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
