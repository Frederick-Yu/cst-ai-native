export const dynamic = "force-dynamic";

import { prisma } from "@/shared/lib/prisma";
import { AuthenticatedLayout } from "@/shared/components/layout/authenticated-layout";
import { AuditLogFilter } from "@/domains/audit/components/audit-log-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollText } from "lucide-react";

export default async function AuditLogsPage() {
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      user: { select: { name: true } },
      customer: { select: { id: true, name: true } },
    },
  }).catch((error) => {
    console.error("[AuditLogsPage]", error);
    throw new Error("감사 로그를 불러오는 중 오류가 발생했습니다");
  });

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-stone-100">
            <ScrollText className="size-5 text-stone-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800">감사 로그</h1>
            <p className="text-sm text-stone-500">모든 데이터 변경 및 접근 이력을 확인합니다.</p>
          </div>
        </div>

        <Card className="border-stone-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-700">
              전체 이력
              <span className="ml-2 text-xs font-normal text-stone-400">
                (최근 {auditLogs.length}건)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AuditLogFilter logs={auditLogs} />
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
