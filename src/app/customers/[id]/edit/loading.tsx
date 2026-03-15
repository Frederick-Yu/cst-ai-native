import { Skeleton } from "@/components/ui/skeleton";

export default function EditCustomerLoading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex flex-col gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
