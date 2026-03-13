export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { CustomerCard } from "@/components/customer/customer-card";
import { CustomerSearchBar } from "@/components/customer/customer-search-bar";
import { ContractStatus } from "@prisma/client";
import { Plus } from "lucide-react";

interface CustomersPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { q, status } = await searchParams;

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
  });

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">고객사 목록</h1>
            <p className="mt-1 text-sm text-stone-500">
              총 {customers.length}개 고객사
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        {customers.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            {q ? `"${q}"에 해당하는 고객사가 없습니다.` : "등록된 고객사가 없습니다."}
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
