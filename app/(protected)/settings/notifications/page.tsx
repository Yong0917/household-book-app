import Link from "next/link";
import { ChevronLeft, Bell, RefreshCw, BarChart2 } from "lucide-react";
import { getNotificationHistory, type NotificationHistoryItem } from "@/lib/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// 현재 KST 날짜 문자열 계산 (서버 실행 시점 기준)
const nowKST = new Date(Date.now() + 9 * 60 * 60 * 1000);
const todayStr = `${nowKST.getUTCFullYear()}-${nowKST.getUTCMonth()}-${nowKST.getUTCDate()}`;
const yesterdayKST = new Date(nowKST.getTime() - 24 * 60 * 60 * 1000);
const yesterdayStr = `${yesterdayKST.getUTCFullYear()}-${yesterdayKST.getUTCMonth()}-${yesterdayKST.getUTCDate()}`;

// 알림 sent_at 값을 KST 날짜 키(YYYY-M-D)로 변환
function getDateKey(sentAt: string): string {
  const d = new Date(new Date(sentAt).getTime() + 9 * 60 * 60 * 1000);
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

// 날짜 키를 사람이 읽기 쉬운 레이블로 변환
function getGroupLabel(dateKey: string): string {
  if (dateKey === todayStr) return "오늘";
  if (dateKey === yesterdayStr) return "어제";
  const parts = dateKey.split("-");
  return `${parseInt(parts[1]) + 1}월 ${parts[2]}일`;
}

// 알림 타입별 아이콘 컴포넌트
function NotificationIcon({ type }: { type: NotificationHistoryItem["type"] }) {
  if (type === "monthly_report") {
    return (
      <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center shrink-0">
        <BarChart2 className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }
  if (type === "monthly_summary") {
    return (
      <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center shrink-0">
        <RefreshCw className="h-[18px] w-[18px] text-amber-600 dark:text-amber-400" />
      </div>
    );
  }
  // recurring
  return (
    <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-950/80 flex items-center justify-center shrink-0">
      <Bell className="h-[18px] w-[18px] text-violet-600 dark:text-violet-400" />
    </div>
  );
}

// 알림 타입별 pill 배지 컴포넌트
function TypeBadge({ type }: { type: NotificationHistoryItem["type"] }) {
  if (type === "monthly_report") {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
        월 결산
      </span>
    );
  }
  if (type === "monthly_summary") {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
        월말 요약
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-400">
      고정비
    </span>
  );
}

// 개별 알림 카드 내용 (링크/div 래퍼 외부에서 공유)
function NotificationCardContent({ item }: { item: NotificationHistoryItem }) {
  const sentDate = new Date(item.sent_at);
  const timeAgo = formatDistanceToNow(sentDate, { addSuffix: true, locale: ko });

  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <NotificationIcon type={item.type} />
      <div className="flex-1 min-w-0">
        {/* 타입 배지 + 경과 시간 */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <TypeBadge type={item.type} />
          <span className="text-[11px] text-muted-foreground/50 shrink-0">{timeAgo}</span>
        </div>
        {/* 알림 제목 */}
        <p className="text-[13.5px] font-semibold text-foreground leading-snug">{item.title}</p>
        {/* 알림 본문 */}
        <p className="text-[12.5px] text-muted-foreground/80 mt-0.5 leading-[1.6] whitespace-pre-line">
          {item.body}
        </p>
      </div>
    </div>
  );
}

export default async function NotificationsPage() {
  const items = await getNotificationHistory();

  // 날짜별 그룹핑 (sent_at 내림차순이므로 순서 유지)
  const groupMap = new Map<string, NotificationHistoryItem[]>();
  for (const item of items) {
    const key = getDateKey(item.sent_at);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(item);
  }
  const groups = Array.from(groupMap.entries());

  return (
    <>
      {/* 헤더 */}
      <header
        className="border-b border-border/40"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="h-14 flex items-center justify-between gap-2 px-4">
          {/* 뒤로가기 + 제목 */}
          <div className="flex items-center gap-1">
            <Link
              href="/settings"
              className="p-1.5 -ml-1.5 rounded-full hover:bg-muted/60 transition-colors"
              aria-label="설정으로 돌아가기"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <h1 className="text-[17px] font-bold tracking-tight">알림 히스토리</h1>
          </div>
          {/* 전체 알림 개수 배지 */}
          {items.length > 0 && (
            <span
              className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold bg-muted text-muted-foreground min-w-[28px]"
              aria-label={`총 ${items.length}개 알림`}
            >
              {items.length}
            </span>
          )}
        </div>
      </header>

      <div className="px-4 mt-5 pb-24">
        {items.length === 0 ? (
          /* 빈 상태 화면 */
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-16 rounded-3xl bg-muted/60 flex items-center justify-center mb-1">
              <Bell className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-[15px] font-semibold text-foreground/70">받은 알림이 없어요</p>
            <p className="text-[13px] text-muted-foreground/60 text-center leading-relaxed">
              고정비 결제일이나 월말에
              <br />
              알림을 보내드려요
            </p>
          </div>
        ) : (
          /* 날짜별 그룹 목록 */
          <div className="space-y-6">
            {groups.map(([dateKey, groupItems]) => (
              <section key={dateKey} aria-label={`${getGroupLabel(dateKey)} 알림`}>
                {/* 날짜 그룹 레이블 */}
                <p className="text-[12px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 px-1">
                  {getGroupLabel(dateKey)}
                </p>
                {/* 같은 날짜의 알림 카드 그룹 */}
                <div className="rounded-2xl border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
                  {groupItems.map((item) => {
                    const screen = item.data?.screen as string | undefined;

                    // 연결할 화면이 있으면 Link로, 없으면 div로 렌더링
                    if (screen) {
                      return (
                        <Link
                          key={item.id}
                          href={screen}
                          className="block hover:bg-muted/40 active:bg-muted/60 transition-colors"
                        >
                          <NotificationCardContent item={item} />
                        </Link>
                      );
                    }

                    return (
                      <div key={item.id}>
                        <NotificationCardContent item={item} />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
