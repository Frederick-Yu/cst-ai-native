export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentChangesWidget } from "@/components/dashboard/recent-changes-widget";

export default async function DashboardPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [customerCount, recentAuditCount, recentHistories] = await Promise.all([
    prisma.customer.count(),
    prisma.auditLog.count({
      where: {
        actionType: "ACCESS",
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.history.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        user: { select: { name: true } },
      },
    }),
  ]).catch((error) => {
    console.error("[DashboardPage]", error);
    throw new Error("대시보드 데이터를 불러오는 중 오류가 발생했습니다");
  });

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800">대시보드</h1>
          <p className="mt-1 text-sm text-stone-500">고객사 현황 및 최근 활동을 확인합니다.</p>
        </div>

        <div className="flex flex-col gap-6">
          <DashboardStats
            customerCount={customerCount}
            recentAuditCount={recentAuditCount}
          />
          <RecentChangesWidget initialChanges={recentHistories} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
