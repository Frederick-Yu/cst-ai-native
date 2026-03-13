"use client";

import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuditLogsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center">
      <div className="mx-auto w-full max-w-md rounded-xl border border-rose-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-rose-100">
            <AlertTriangle className="size-6 text-rose-500" aria-hidden="true" />
          </div>
        </div>
        <h2 className="mb-2 text-lg font-bold text-stone-800">감사 로그를 불러올 수 없습니다</h2>
        <p className="mb-1 text-sm text-stone-500">데이터를 가져오는 중 오류가 발생했습니다.</p>
        {error.digest && (
          <p className="mb-4 font-mono text-xs text-stone-400">오류 코드: {error.digest}</p>
        )}
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            대시보드로
          </Link>
        </div>
      </div>
    </div>
  );
}
