import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { CustomerCard } from "@/components/customer/customer-card";
import { CustomerSearchBar } from "@/components/customer/customer-search-bar";
import { ContractStatus } from "@prisma/client";
import { Plus } from "lucide-react";

const STATUS_FILTERS: { value: ContractStatus | null; label: string }[] = [
  { value: null, label: "전체" },
  { value: "ACTIVE", label: "계약 중" },
  { value: "PENDING", label: "대기" },
  { value: "INACTIVE", label: "비활성" },
  { value: "TERMINATED", label: "종료" },
];

interface CustomersPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { q, status } = await searchParams;

  function buildFilterUrl(statusValue: ContractStatus | null) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (statusValue) params.set("status", statusValue);
    const str = params.toString();
    return str ? `/customers?${str}` : "/customers";
  }

  const customers = await prisma.customer.findMany({
    where: {
      ...(q && {
        name: { contains: q, mode: "insensitive" },
      }),
      ...(status && Object.values(ContractStatus).includes(status as ContractStatus) && {
        contractStatus: status as ContractStatus,
      }),
    },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { histories: true, systemInfos: true },
      },
    },
  }).catch((error) => {
    console.error("[CustomersPage]", error);
    throw new Error("고객사 목록을 불러오는 중 오류가 발생했습니다");
  });

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">고객사 목록</h1>
            <p className="mt-1 text-sm text-stone-500">
              총 {customers.length}개 고객사
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CustomerSearchBar defaultValue={q} />
            <Link
              href="/customers/new"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500"
            >
              <Plus className="size-4" aria-hidden="true" />
              고객사 등록
            </Link>
          </div>
        </div>

        {/* 계약 상태 필터 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((item) => {
            const isActive = item.value === null ? !status : status === item.value;
            return (
              <Link
                key={item.value ?? "ALL"}
                href={buildFilterUrl(item.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {customers.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            {q || status ? "조건에 해당하는 고객사가 없습니다." : "등록된 고객사가 없습니다."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
