import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { CustomerEditForm } from "@/components/customer/customer-edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerEditPage({ params }: EditPageProps) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      industryType: true,
      contractStatus: true,
      description: true,
    },
  }).catch((error) => {
    console.error("[CustomerEditPage]", error);
    throw new Error("고객사 정보를 불러오는 중 오류가 발생했습니다");
  });

  if (!customer) notFound();

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-xl px-4 py-8">
        <Card className="border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-stone-800">
              <Pencil className="size-5 text-teal-600" aria-hidden="true" />
              기본 정보 수정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerEditForm customer={customer} />
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
