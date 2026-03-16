import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { AuthenticatedLayout } from "@/shared/components/layout/authenticated-layout";
import { CustomerTimeline } from "@/domains/customer/components/customer-timeline";
import { SystemInfoCard } from "@/domains/customer/components/system-info-card";
import { StakeholderList } from "@/domains/customer/components/stakeholder-list";
import { AddStakeholderDialog } from "@/domains/customer/components/add-stakeholder-dialog";
import { AddSystemInfoDialog } from "@/domains/customer/components/add-system-info-dialog";
import { AddHistoryDialog } from "@/domains/customer/components/add-history-dialog";
import { ChangeHistoryTabs } from "@/domains/customer/components/change-history-tabs";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ContractStatus } from "@prisma/client";
import { Pencil } from "lucide-react";

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

  const [customer, auditLogs] = await Promise.all([
    prisma.customer.findUnique({
      where: { id },
      include: {
        stakeholders: { orderBy: { role: "asc" } },
        histories: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        },
        systemInfos: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.auditLog.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ]).catch((error) => {
    console.error("[CustomerDetailPage]", error);
    throw new Error("고객사 정보를 불러오는 중 오류가 발생했습니다");
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
          <Link
            href={`/customers/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-50"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            기본 정보 수정
          </Link>
        </div>

        {/* 2열 레이아웃 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 좌측: 담당자 + 시스템 정보 */}
          <aside className="flex flex-col gap-6 lg:col-span-1">
            {/* 담당자 */}
            <Card className="border-stone-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-stone-700">담당자</CardTitle>
                <AddStakeholderDialog customerId={id} />
              </CardHeader>
              <CardContent>
                <StakeholderList stakeholders={customer.stakeholders} />
              </CardContent>
            </Card>

            {/* 시스템 정보 */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-stone-700">시스템 정보</h2>
                <AddSystemInfoDialog customerId={id} />
              </div>
              {customer.systemInfos.length === 0 ? (
                <p className="rounded-lg border border-dashed border-stone-200 py-6 text-center text-sm text-stone-400">
                  등록된 시스템 정보가 없습니다.
                </p>
              ) : (
                customer.systemInfos.map((info) => (
                  <SystemInfoCard key={info.id} systemInfo={info} />
                ))
              )}
            </div>
          </aside>

          {/* 우측: 타임라인 */}
          <section className="lg:col-span-2">
            <Card className="border-stone-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-stone-700">
                  이력 타임라인
                  <span className="ml-2 text-xs font-normal text-stone-400">
                    ({customer.histories.length}건)
                  </span>
                </CardTitle>
                <AddHistoryDialog customerId={id} />
              </CardHeader>
              <CardContent>
                <CustomerTimeline histories={customer.histories} customerId={id} />
              </CardContent>
            </Card>
          </section>
        </div>

        {/* 변경 이력 */}
        <Card className="mt-6 border-stone-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-700">
              변경 이력
              <span className="ml-2 text-xs font-normal text-stone-400">({auditLogs.length}건)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChangeHistoryTabs auditLogs={auditLogs} />
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
