"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { EventType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  INSTALLATION: "구축",
  MAINTENANCE: "유지보수",
  INCIDENT: "장애",
  UPDATE: "업데이트",
  MEETING: "미팅",
  OTHER: "기타",
};

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  INSTALLATION: "bg-teal-100 text-teal-700",
  MAINTENANCE: "bg-blue-100 text-blue-700",
  INCIDENT: "bg-rose-100 text-rose-700",
  UPDATE: "bg-amber-100 text-amber-700",
  MEETING: "bg-purple-100 text-purple-700",
  OTHER: "bg-stone-100 text-stone-600",
};

interface RecentChange {
  id: string;
  customerId: string;
  eventType: EventType;
  title: string;
  content: string;
  createdAt: Date;
  customer: { name: string };
  user: { name: string };
}

interface RecentChangesWidgetProps {
  initialChanges: RecentChange[];
}

export function RecentChangesWidget({ initialChanges }: RecentChangesWidgetProps) {
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base text-stone-800">최근 변경 이력</CardTitle>
        <Link
          href="/customers"
          className="flex items-center gap-1 text-xs text-teal-600 hover:underline"
        >
          전체 고객사
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </CardHeader>
      <CardContent>
        {initialChanges.length === 0 ? (
          <p className="py-4 text-center text-sm text-stone-400">등록된 이력이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {initialChanges.map((change) => (
              <li key={change.id} className="py-3">
                <Link
                  href={`/customers/${change.customerId}`}
                  className="group flex flex-col gap-1 hover:opacity-80"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`text-xs ${EVENT_TYPE_COLORS[change.eventType]}`}>
                        {EVENT_TYPE_LABELS[change.eventType]}
                      </Badge>
                      <span className="text-sm font-medium text-stone-800 group-hover:text-teal-700">
                        {change.title}
                      </span>
                    </div>
                    <time
                      className="shrink-0 text-xs text-stone-400"
                      dateTime={new Date(change.createdAt).toISOString()}
                    >
                      {formatDistanceToNow(new Date(change.createdAt), { addSuffix: true, locale: ko })}
                    </time>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>{change.customer.name}</span>
                    <span>·</span>
                    <span>{change.user.name}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
