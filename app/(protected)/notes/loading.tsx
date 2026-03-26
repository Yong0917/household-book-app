export default function NotesLoading() {
  return (
    <div className="flex flex-col min-h-dvh animate-pulse">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="h-7 w-16 bg-muted rounded-lg" />
        <div className="h-8 w-8 bg-muted rounded-full" />
      </div>

      {/* 카드 스켈레톤 */}
      <div className="flex flex-col gap-3 px-4 pt-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 p-4 flex flex-col gap-2">
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
