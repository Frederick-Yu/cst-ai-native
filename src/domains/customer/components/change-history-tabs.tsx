"use client";

import { useState } from "react";
import { ActionType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { ShieldCheck, User, Server, Settings, Clock } from "lucide-react";

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

interface AuditLogEntry {
  id: string;
  actionType: ActionType;
  targetData: string;
  accessReason: string;
  createdAt: Date;
  user: { name: string };
}

type TabKey = "ALL" | "CUSTOMER" | "STAKEHOLDER" | "SYSTEMINFO";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "ALL", label: "전체", icon: <Clock className="size-3.5" aria-hidden="true" /> },
  { key: "CUSTOMER", label: "기본정보", icon: <Settings className="size-3.5" aria-hidden="true" /> },
  { key: "STAKEHOLDER", label: "담당자", icon: <User className="size-3.5" aria-hidden="true" /> },
  { key: "SYSTEMINFO", label: "시스템정보", icon: <Server className="size-3.5" aria-hidden="true" /> },
];

function filterLogs(logs: AuditLogEntry[], tab: TabKey): AuditLogEntry[] {
  if (tab === "ALL") return logs;
  if (tab === "CUSTOMER") return logs.filter((l) => l.targetData.startsWith("Customer:"));
  if (tab === "STAKEHOLDER") return logs.filter((l) => l.targetData.startsWith("Stakeholder"));
  if (tab === "SYSTEMINFO") return logs.filter((l) => l.targetData.startsWith("SystemInfo"));
  return logs;
}

export function ChangeHistoryTabs({ auditLogs }: { auditLogs: AuditLogEntry[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");

  const filtered = filterLogs(auditLogs, activeTab);

  return (
    <div className="flex flex-col gap-3">
      {/* 탭 헤더 */}
      <div className="overflow-x-auto scrollbar-hide border-b border-stone-100">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const count = filterLogs(auditLogs, tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "border-teal-500 text-teal-700"
                    : "border-transparent text-stone-500 hover:text-stone-700"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    activeTab === tab.key ? "bg-teal-100 text-teal-700" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 이력 목록 */}
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-stone-400">변경 이력이 없습니다.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-stone-100">
          {filtered.map((log) => (
            <li key={log.id} className="flex flex-col gap-1 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${ACTION_TYPE_COLORS[log.actionType]}`}
                >
                  {log.actionType === "ACCESS" && (
                    <ShieldCheck className="size-3" aria-hidden="true" />
                  )}
                  {ACTION_TYPE_LABELS[log.actionType]}
                </span>
                <span className="text-xs font-medium text-stone-700">{log.targetData}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <User className="size-3 shrink-0" aria-hidden="true" />
                <span>{log.user.name}</span>
                <span className="text-stone-300">·</span>
                <span className="truncate">{log.accessReason}</span>
                <span className="text-stone-300 hidden sm:inline">·</span>
                <time
                  className="text-stone-400 sm:ml-auto"
                  dateTime={new Date(log.createdAt).toISOString()}
                >
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ko })}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
