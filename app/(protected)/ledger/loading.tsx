export default function LedgerLoading() {
  return (
    <div className="flex flex-col min-h-dvh animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="h-7 w-24 bg-muted rounded-lg" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-muted rounded-full" />
          <div className="h-8 w-8 bg-muted rounded-full" />
        </div>
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex gap-2 px-4 pb-3">
        <div className="h-8 w-16 bg-muted rounded-full" />
        <div className="h-8 w-16 bg-muted rounded-full" />
      </div>

      {/* 리스트 아이템 스켈레톤 */}
      <div className="flex flex-col gap-3 px-4 pt-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-full shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
