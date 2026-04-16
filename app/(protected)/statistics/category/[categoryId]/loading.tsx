export default function CategoryDetailLoading() {
  return (
    <div className="min-h-dvh animate-pulse">
      {/* 헤더 */}
      <div
        className="sticky top-0 border-b border-border/60 z-10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-2 h-12">
          <div className="flex items-center gap-2 pl-2">
            <div className="h-5 w-5 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-8 w-8 bg-muted rounded-full" />
          </div>
        </div>
      </div>

      {/* 월총액 */}
      <div className="px-5 pt-5 pb-3">
        <div className="h-3 w-10 bg-muted rounded mb-2" />
        <div className="h-9 w-40 bg-muted rounded" />
      </div>

      {/* 차트 영역 */}
      <div className="px-4 pb-4">
        <div className="h-[180px] bg-muted rounded-xl" />
      </div>

      {/* 거래 목록 */}
      <div className="space-y-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-5 py-3.5 border-b border-border/30">
            <div className="h-3 w-16 bg-muted rounded mb-1.5" />
            <div className="h-4 w-32 bg-muted rounded mb-1" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
