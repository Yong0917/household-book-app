"use client";

// 가계부 탭 뷰 ("일일" 목록 / "달력" 전환)
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DailyView } from "./DailyView";
import { CalendarView } from "./CalendarView";

type Tab = "list" | "calendar";

export function LedgerTabView() {
  const [tab, setTab] = useState<Tab>("list");

  return (
    <div className="flex flex-col">
      {/* 탭 바 */}
      <div className="flex h-12 border-b sticky top-0 z-20 bg-background">
        <button
          onClick={() => setTab("list")}
          className={cn(
            "flex-1 text-sm font-medium transition-colors relative",
            tab === "list" ? "text-primary" : "text-muted-foreground"
          )}
        >
          일일
          {tab === "list" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setTab("calendar")}
          className={cn(
            "flex-1 text-sm font-medium transition-colors relative",
            tab === "calendar" ? "text-primary" : "text-muted-foreground"
          )}
        >
          달력
          {tab === "calendar" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {tab === "list" ? <DailyView /> : <CalendarView />}
    </div>
  );
}
