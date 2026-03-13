import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-1 h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* 2열 레이아웃 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 좌측 */}
        <aside className="flex flex-col gap-6 lg:col-span-1">
          {/* 담당자 카드 */}
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-12" />
            </div>
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 시스템 정보 */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-12" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="mb-3 rounded-xl border border-stone-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="mb-1 h-3 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </aside>

        {/* 우측: 타임라인 */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="mt-1 size-2 shrink-0 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="mb-1.5 h-4 w-48" />
                    <Skeleton className="mb-2 h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 변경 이력 */}
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
