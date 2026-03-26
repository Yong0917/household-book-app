export default function SettingsLoading() {
  return (
    <div className="flex flex-col min-h-dvh animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="px-4 pt-12 pb-6">
        <div className="h-7 w-16 bg-muted rounded-lg" />
      </div>

      {/* 프로필 스켈레톤 */}
      <div className="flex items-center gap-3 px-4 pb-6">
        <div className="h-12 w-12 bg-muted rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-3 w-44 bg-muted rounded" />
        </div>
      </div>

      {/* 섹션 스켈레톤 */}
      {[...Array(3)].map((_, s) => (
        <div key={s} className="px-4 pb-4">
          <div className="h-3 w-20 bg-muted rounded mb-2" />
          <div className="rounded-xl border border-border/40 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border/40 last:border-0">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-4 w-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
