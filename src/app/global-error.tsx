"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
          <div className="w-full max-w-md rounded-xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex justify-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-rose-100">
                <AlertTriangle className="size-7 text-rose-500" aria-hidden="true" />
              </div>
            </div>
            <h1 className="mb-2 text-xl font-bold text-stone-800">오류가 발생했습니다</h1>
            <p className="mb-1 text-sm text-stone-500">예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
            {error.digest && (
              <p className="mb-4 font-mono text-xs text-stone-400">오류 코드: {error.digest}</p>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
