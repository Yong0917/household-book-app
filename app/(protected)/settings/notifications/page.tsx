import Link from "next/link";
import { ChevronLeft, Bell, RefreshCw, BarChart2 } from "lucide-react";
import { getNotificationHistory } from "@/lib/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// 알림 타입별 아이콘/색상
function NotificationIcon({ type }: { type: string }) {
  if (type === "monthly_report") {
    return (
      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
        <BarChart2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }
  if (type === "monthly_summary") {
    return (
      <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
        <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
    );
  }
  // recurring
  return (
    <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0">
      <Bell className="h-4 w-4 text-violet-600 dark:text-violet-400" />
    </div>
  );
}

export default async function NotificationsPage() {
  const items = await getNotificationHistory();

  return (
    <>
      {/* 헤더 */}
      <header className="border-b border-border/40" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="h-14 flex items-center gap-2 px-4">
          <Link
            href="/settings"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-muted/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h1 className="text-[17px] font-bold tracking-tight">알림 히스토리</h1>
        </div>
      </header>

      <div className="px-4 mt-5 pb-24">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
            <Bell className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm mt-2">받은 알림이 없어요</p>
            <p className="text-xs text-muted-foreground/60">고정비 결제일이나 월말에 알림이 와요</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
            {items.map((item) => {
              const screen = item.data?.screen as string | undefined;
              const sentDate = new Date(item.sent_at);
              const timeAgo = formatDistanceToNow(sentDate, { addSuffix: true, locale: ko });

              const content = (
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <NotificationIcon type={item.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground leading-snug">{item.title}</p>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5 leading-relaxed whitespace-pre-line">{item.body}</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-1">{timeAgo}</p>
                  </div>
                </div>
              );

              if (screen) {
                return (
                  <Link
                    key={item.id}
                    href={screen}
                    className="block hover:bg-muted/40 active:bg-muted/60 transition-colors"
                  >
                    {content}
                  </Link>
                );
              }

              return <div key={item.id}>{content}</div>;
            })}
          </div>
        )}
      </div>
    </>
  );
}
