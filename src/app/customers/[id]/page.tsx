export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { CustomerTimeline } from "@/components/customer/customer-timeline";
import { SystemInfoCard } from "@/components/customer/system-info-card";
import { StakeholderList } from "@/components/customer/stakeholder-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractStatus } from "@prisma/client";

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  ACTIVE: "계약 중",
  INACTIVE: "비활성",
  PENDING: "대기",
  TERMINATED: "종료",
};

const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  ACTIVE: "bg-teal-100 text-teal-700",
  INACTIVE: "bg-stone-100 text-stone-600",
  PENDING: "bg-amber-100 text-amber-700",
  TERMINATED: "bg-rose-100 text-rose-700",
};

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      stakeholders: { orderBy: { role: "asc" } },
      histories: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
      systemInfos: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!customer) {
    notFound();
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-800">{customer.name}</h1>
              <Badge className={`text-sm ${CONTRACT_STATUS_COLORS[customer.contractStatus]}`}>
                {CONTRACT_STATUS_LABELS[customer.contractStatus]}
              </Badge>
            </div>
            {customer.description && (
              <p className="mt-1 text-sm text-stone-500">{customer.description}</p>
            )}
          </div>
        </div>

        {/* 2열 레이아웃 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 좌측: 담당자 + 시스템 정보 */}
          <aside className="flex flex-col gap-6 lg:col-span-1">
            {/* 담당자 */}
            <Card className="border-stone-200 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-stone-700">담당자</CardTitle>
              </CardHeader>
              <CardContent>
                <StakeholderList stakeholders={customer.stakeholders} />
              </CardContent>
            </Card>

            {/* 시스템 정보 */}
            {customer.systemInfos.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-stone-700">시스템 정보</h2>
                {customer.systemInfos.map((info) => (
                  <SystemInfoCard key={info.id} systemInfo={info} />
                ))}
              </div>
            )}
          </aside>

          {/* 우측: 타임라인 */}
          <section className="lg:col-span-2">
            <Card className="border-stone-200 bg-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-stone-700">
                  이력 타임라인
                  <span className="ml-2 text-xs font-normal text-stone-400">
                    ({customer.histories.length}건)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerTimeline histories={customer.histories} />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
