import { Skeleton } from "@/shared/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <Skeleton className="mb-2 h-8 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="flex flex-col gap-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-white p-5">
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="h-9 w-16" />
            </div>
          ))}
        </div>

        {/* 최근 변경 이력 */}
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <Skeleton className="mb-4 h-5 w-28" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-1">
                <Skeleton className="mt-0.5 size-2 shrink-0 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-1.5 h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
