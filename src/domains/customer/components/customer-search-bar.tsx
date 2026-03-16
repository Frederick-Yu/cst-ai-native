"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

export function CustomerSearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="relative w-full max-w-sm">
      <Search
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="고객사명 검색..."
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-9"
        aria-label="고객사 검색"
      />
    </div>
  );
}
