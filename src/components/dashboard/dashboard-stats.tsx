import { Building2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStatsProps {
  customerCount: number;
  recentAuditCount: number;
}

export function DashboardStats({ customerCount, recentAuditCount }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card className="border-stone-200 bg-white">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-lg bg-teal-50">
            <Building2 className="size-6 text-teal-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-stone-500">관리 고객사</p>
            <p className="text-2xl font-bold text-stone-900">{customerCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 bg-white">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-lg bg-rose-50">
            <ShieldCheck className="size-6 text-rose-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-stone-500">7일 보안 접근</p>
            <p className="text-2xl font-bold text-stone-900">{recentAuditCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
