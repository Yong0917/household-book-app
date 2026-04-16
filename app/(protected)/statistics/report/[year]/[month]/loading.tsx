export default function MonthlyReportLoading() {
  return (
    <div className="min-h-dvh animate-pulse">
      {/* 헤더 */}
      <div
        className="sticky top-0 border-b border-border/60 z-10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between px-3 h-13">
          <div className="h-5 w-5 bg-muted rounded" />
          <div className="h-5 w-28 bg-muted rounded" />
          <div className="h-5 w-5 bg-muted rounded" />
        </div>
      </div>

      {/* 수입/지출 요약 */}
      <div className="px-5 pt-6 pb-4 space-y-4">
        <div className="h-6 w-32 bg-muted rounded mx-auto" />
        <div className="flex justify-center gap-8">
          <div className="space-y-1.5 items-center flex flex-col">
            <div className="h-3 w-8 bg-muted rounded" />
            <div className="h-7 w-28 bg-muted rounded" />
          </div>
          <div className="space-y-1.5 items-center flex flex-col">
            <div className="h-3 w-8 bg-muted rounded" />
            <div className="h-7 w-28 bg-muted rounded" />
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="mx-4 mb-4">
        <div className="h-[200px] bg-muted rounded-2xl" />
      </div>

      {/* 카테고리 리스트 */}
      <div className="px-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-3 bg-muted rounded-full shrink-0" />
            <div className="h-4 w-28 bg-muted rounded flex-1" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
