"use client";

import { StakeholderRole } from "@prisma/client";
import { Badge } from "@/shared/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import { EditStakeholderDialog } from "./edit-stakeholder-dialog";

const ROLE_LABELS: Record<StakeholderRole, string> = {
  CONTACT: "담당자",
  MANAGER: "관리자",
  TECHNICAL: "기술담당",
  EXECUTIVE: "임원",
};

const ROLE_COLORS: Record<StakeholderRole, string> = {
  CONTACT: "bg-stone-100 text-stone-600",
  MANAGER: "bg-teal-100 text-teal-700",
  TECHNICAL: "bg-blue-100 text-blue-700",
  EXECUTIVE: "bg-purple-100 text-purple-700",
};

interface Stakeholder {
  id: string;
  customerId: string;
  name: string;
  role: StakeholderRole;
  email: string | null;
  phone: string | null;
}

export function StakeholderList({ stakeholders }: { stakeholders: Stakeholder[] }) {
  if (stakeholders.length === 0) {
    return (
      <p className="py-4 text-sm text-stone-400">등록된 담당자가 없습니다.</p>
    );
  }

  return (
    <ul className="divide-y divide-stone-100">
      {stakeholders.map((s) => (
        <li key={s.id} className="py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm text-stone-800">{s.name}</span>
            <div className="flex items-center gap-1">
              <Badge className={`shrink-0 text-xs ${ROLE_COLORS[s.role]}`}>
                {ROLE_LABELS[s.role]}
              </Badge>
              <EditStakeholderDialog stakeholder={s} />
            </div>
          </div>
          <div className="mt-1 flex flex-col gap-0.5 text-xs text-stone-500">
            {s.email && (
              <a
                href={`mailto:${s.email}`}
                className="flex items-center gap-1 hover:text-teal-600"
              >
                <Mail className="size-3" aria-hidden="true" />
                {s.email}
              </a>
            )}
            {s.phone && (
              <a
                href={`tel:${s.phone}`}
                className="flex items-center gap-1 hover:text-teal-600"
              >
                <Phone className="size-3" aria-hidden="true" />
                {s.phone}
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
