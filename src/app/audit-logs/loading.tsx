import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLogsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="size-9 rounded-lg" />
        <div>
          <Skeleton className="mb-1 h-6 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* 카드 */}
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <Skeleton className="mb-4 h-4 w-28" />

        {/* 필터 */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>

        {/* 테이블 헤더 */}
        <div className="mb-2 hidden grid-cols-5 gap-4 border-b border-stone-100 pb-2 md:grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>

        {/* 테이블 로우 */}
        <div className="flex flex-col gap-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 border-b border-stone-100 py-3 md:grid md:grid-cols-5 md:items-center md:gap-4"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full max-w-xs" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
