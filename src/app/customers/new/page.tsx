import { AuthenticatedLayout } from "@/shared/components/layout/authenticated-layout";
import { CustomerForm } from "@/domains/customer/components/customer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Building2 } from "lucide-react";

export default function NewCustomerPage() {
  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-xl px-4 py-8">
        <Card className="border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-stone-800">
              <Building2 className="size-5 text-teal-600" aria-hidden="true" />
              고객사 등록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm />
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
