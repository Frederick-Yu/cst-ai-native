"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ActionType } from "@prisma/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Search, ShieldCheck, User, Server, Settings, FileText } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  CREATE: "등록",
  READ: "조회",
  UPDATE: "수정",
  DELETE: "삭제",
  ACCESS: "접근",
};

const ACTION_TYPE_COLORS: Record<ActionType, string> = {
  CREATE: "bg-teal-100 text-teal-700",
  READ: "bg-blue-100 text-blue-700",
  UPDATE: "bg-amber-100 text-amber-700",
  DELETE: "bg-rose-100 text-rose-700",
  ACCESS: "bg-purple-100 text-purple-700",
};

type TargetFilter = "ALL" | "CUSTOMER" | "STAKEHOLDER" | "SYSTEMINFO" | "OTHER";

const TARGET_FILTERS: { key: TargetFilter; label: string; icon: React.ReactNode }[] = [
  { key: "ALL", label: "전체", icon: <FileText className="size-3.5" aria-hidden="true" /> },
  { key: "CUSTOMER", label: "기본정보", icon: <Settings className="size-3.5" aria-hidden="true" /> },
  { key: "STAKEHOLDER", label: "담당자", icon: <User className="size-3.5" aria-hidden="true" /> },
  { key: "SYSTEMINFO", label: "시스템정보", icon: <Server className="size-3.5" aria-hidden="true" /> },
];

export interface AuditLogItem {
  id: string;
  actionType: ActionType;
  targetData: string;
  accessReason: string;
  createdAt: Date;
  user: { name: string };
  customer: { id: string; name: string } | null;
}

function matchTarget(targetData: string, filter: TargetFilter): boolean {
  if (filter === "ALL") return true;
  if (filter === "CUSTOMER") return targetData.startsWith("Customer:");
  if (filter === "STAKEHOLDER") return targetData.startsWith("Stakeholder");
  if (filter === "SYSTEMINFO") return targetData.startsWith("SystemInfo");
  return true;
}

export function AuditLogFilter({ logs }: { logs: AuditLogItem[] }) {
  const [targetFilter, setTargetFilter] = useState<TargetFilter>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (!matchTarget(log.targetData, targetFilter)) return false;
      if (q) {
        return (
          log.user.name.toLowerCase().includes(q) ||
          log.targetData.toLowerCase().includes(q) ||
          log.accessReason.toLowerCase().includes(q) ||
          (log.customer?.name.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [logs, targetFilter, search]);

  return (
    <div className="flex flex-col gap-4">
      {/* 필터 바 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* 대상 탭 */}
        <div className="flex gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1">
          {TARGET_FILTERS.map((tab) => {
            const count = logs.filter((l) => matchTarget(l.targetData, tab.key)).length;
            return (
              <button
                key={tab.key}
                onClick={() => setTargetFilter(tab.key)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  targetFilter === tab.key
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    targetFilter === tab.key
                      ? "bg-teal-100 text-teal-700"
                      : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 검색 */}
        <div className="relative md:w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="작업자, 대상, 사유 검색"
            className="pl-8 text-sm"
          />
        </div>
      </div>

      {/* 결과 수 */}
      <p className="text-xs text-stone-400">{filtered.length}건의 로그</p>

      {/* 테이블 (데스크탑) / 카드 (모바일) */}
      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-200 py-12 text-center text-sm text-stone-400">
          조건에 맞는 감사 로그가 없습니다.
        </p>
      ) : (
        <>
          {/* 데스크탑 테이블 */}
          <div className="hidden overflow-hidden rounded-lg border border-stone-200 md:block">
            <table className="w-full text-sm">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">일시</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">작업자</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">액션</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">대상</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">고객사</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500">사유</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-500">
                      {format(new Date(log.createdAt), "yyyy.MM.dd HH:mm", { locale: ko })}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-stone-700">{log.user.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${ACTION_TYPE_COLORS[log.actionType]}`}
                      >
                        {log.actionType === "ACCESS" && (
                          <ShieldCheck className="size-3" aria-hidden="true" />
                        )}
                        {ACTION_TYPE_LABELS[log.actionType]}
                      </span>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs text-stone-600">
                      {log.targetData}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {log.customer ? (
                        <Link
                          href={`/customers/${log.customer.id}`}
                          className="text-teal-600 hover:underline"
                        >
                          {log.customer.name}
                        </Link>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-xs text-stone-500">
                      {log.accessReason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 */}
          <ul className="flex flex-col gap-3 md:hidden">
            {filtered.map((log) => (
              <li key={log.id} className="rounded-lg border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${ACTION_TYPE_COLORS[log.actionType]}`}
                    >
                      {log.actionType === "ACCESS" && (
                        <ShieldCheck className="size-3" aria-hidden="true" />
                      )}
                      {ACTION_TYPE_LABELS[log.actionType]}
                    </span>
                    <span className="text-xs font-medium text-stone-700">{log.user.name}</span>
                  </div>
                  <span className="shrink-0 text-xs text-stone-400">
                    {format(new Date(log.createdAt), "MM.dd HH:mm", { locale: ko })}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs text-stone-600">{log.targetData}</p>
                {log.customer && (
                  <Link
                    href={`/customers/${log.customer.id}`}
                    className="mt-1 block text-xs text-teal-600 hover:underline"
                  >
                    {log.customer.name}
                  </Link>
                )}
                <p className="mt-1 text-xs text-stone-500">{log.accessReason}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
