"use client";

import { useState } from "react";
import { AssetType, ServiceEnv } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Server } from "lucide-react";
import { PasswordRevealDialog } from "./password-reveal-dialog";
import { EditSystemInfoDialog } from "./edit-system-info-dialog";

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  SERVER: "서버",
  DATABASE: "데이터베이스",
  APPLICATION: "애플리케이션",
  NETWORK: "네트워크",
  STORAGE: "스토리지",
  OTHER: "기타",
};

const SERVICE_ENV_LABELS: Record<ServiceEnv, string> = {
  PRODUCTION: "운영",
  STAGING: "스테이징",
  DEVELOPMENT: "개발",
};

const SERVICE_ENV_COLORS: Record<ServiceEnv, string> = {
  PRODUCTION: "bg-rose-100 text-rose-700",
  STAGING: "bg-amber-100 text-amber-700",
  DEVELOPMENT: "bg-stone-100 text-stone-600",
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-stone-400 hover:text-teal-600 transition-colors"
      aria-label={`${label} 복사`}
    >
      {copied ? (
        <Check className="size-3.5 text-teal-600" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
    </button>
  );
}

interface SystemInfo {
  id: string;
  customerId: string;
  name: string;
  assetType: AssetType;
  serviceEnv: ServiceEnv;
  description: string | null;
  host: string | null;
  port: number | null;
  username: string | null;
  passwordHash: string | null;
}

export function SystemInfoCard({ systemInfo }: { systemInfo: SystemInfo }) {
  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-stone-400" aria-hidden="true" />
            <CardTitle className="text-sm font-medium text-stone-800">{systemInfo.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Badge className={`shrink-0 text-xs ${SERVICE_ENV_COLORS[systemInfo.serviceEnv]}`}>
              {SERVICE_ENV_LABELS[systemInfo.serviceEnv]}
            </Badge>
            <EditSystemInfoDialog systemInfo={systemInfo} />
          </div>
        </div>
        <p className="text-xs text-stone-400">{ASSET_TYPE_LABELS[systemInfo.assetType]}</p>
      </CardHeader>

      <CardContent>
        <dl className="flex flex-col gap-2 text-sm">
          {systemInfo.host && (
            <div className="flex items-center justify-between gap-2">
              <dt className="w-16 shrink-0 text-xs text-stone-400">호스트</dt>
              <dd className="flex flex-1 items-center justify-between gap-1 font-mono text-xs text-stone-700">
                <span className="truncate">{systemInfo.host}</span>
                <CopyButton value={systemInfo.host} label="호스트" />
              </dd>
            </div>
          )}
          {systemInfo.port && (
            <div className="flex items-center justify-between gap-2">
              <dt className="w-16 shrink-0 text-xs text-stone-400">포트</dt>
              <dd className="font-mono text-xs text-stone-700">{systemInfo.port}</dd>
            </div>
          )}
          {systemInfo.username && (
            <div className="flex items-center justify-between gap-2">
              <dt className="w-16 shrink-0 text-xs text-stone-400">아이디</dt>
              <dd className="flex flex-1 items-center justify-between gap-1 font-mono text-xs text-stone-700">
                <span className="truncate">{systemInfo.username}</span>
                <CopyButton value={systemInfo.username} label="아이디" />
              </dd>
            </div>
          )}
          {systemInfo.passwordHash && (
            <div className="flex items-center justify-between gap-2">
              <dt className="w-16 shrink-0 text-xs text-stone-400">비밀번호</dt>
              <dd>
                <PasswordRevealDialog
                  systemInfoId={systemInfo.id}
                  systemInfoName={systemInfo.name}
                />
              </dd>
            </div>
          )}
        </dl>

        {systemInfo.description && (
          <p className="mt-3 border-t border-stone-100 pt-3 text-xs text-stone-500">
            {systemInfo.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
