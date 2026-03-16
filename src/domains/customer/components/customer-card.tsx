import Link from "next/link";
import { ContractStatus, IndustryType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Clock, Server } from "lucide-react";

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

const INDUSTRY_TYPE_LABELS: Record<IndustryType, string> = {
  FINANCE: "금융",
  HEALTHCARE: "의료",
  RETAIL: "유통",
  MANUFACTURING: "제조",
  IT: "IT",
  OTHER: "기타",
};

interface CustomerCardProps {
  customer: {
    id: string;
    name: string;
    industryType: IndustryType;
    contractStatus: ContractStatus;
    _count: {
      histories: number;
      systemInfos: number;
    };
  };
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Link href={`/customers/${customer.id}`}>
      <Card className="h-full border-stone-200 bg-white transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base text-stone-800 leading-tight">
              {customer.name}
            </CardTitle>
            <Badge className={`shrink-0 text-xs ${CONTRACT_STATUS_COLORS[customer.contractStatus]}`}>
              {CONTRACT_STATUS_LABELS[customer.contractStatus]}
            </Badge>
          </div>
          <p className="text-xs text-stone-400">
            {INDUSTRY_TYPE_LABELS[customer.industryType]}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-stone-500">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              이력 {customer._count.histories}건
            </span>
            <span className="flex items-center gap-1">
              <Server className="size-3.5" aria-hidden="true" />
              시스템 {customer._count.systemInfos}건
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
