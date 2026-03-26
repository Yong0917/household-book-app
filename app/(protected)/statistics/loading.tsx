export default function StatisticsLoading() {
  return (
    <div className="flex flex-col min-h-dvh animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="h-7 w-16 bg-muted rounded-lg" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-muted rounded-full" />
          <div className="h-8 w-8 bg-muted rounded-full" />
        </div>
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex gap-2 px-4 pb-4">
        <div className="h-8 w-16 bg-muted rounded-full" />
        <div className="h-8 w-16 bg-muted rounded-full" />
      </div>

      {/* 도넛 차트 스켈레톤 */}
      <div className="flex justify-center py-6">
        <div className="h-44 w-44 bg-muted rounded-full" />
      </div>

      {/* 리스트 스켈레톤 */}
      <div className="flex flex-col gap-3 px-4">
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
