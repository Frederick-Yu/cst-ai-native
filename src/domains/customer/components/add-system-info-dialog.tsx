"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { ServerCog, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { createSystemInfo } from "@/domains/customer/actions/system-info.actions";
import { AssetType, ServiceEnv } from "@prisma/client";
import { toast } from "sonner";
import { type FormState, getFieldError, getStringError } from "@/shared/lib/form";

const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: "SERVER", label: "서버" },
  { value: "DATABASE", label: "데이터베이스" },
  { value: "APPLICATION", label: "애플리케이션" },
  { value: "NETWORK", label: "네트워크" },
  { value: "STORAGE", label: "스토리지" },
  { value: "OTHER", label: "기타" },
];

const SERVICE_ENV_OPTIONS: { value: ServiceEnv; label: string }[] = [
  { value: "PRODUCTION", label: "운영" },
  { value: "STAGING", label: "스테이징" },
  { value: "DEVELOPMENT", label: "개발" },
];

export function AddSystemInfoDialog({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await createSystemInfo(formData);
      if (result.success) {
        setOpen(false);
        toast.success("시스템 정보가 추가되었습니다");
        router.refresh();
        return { success: true };
      }
      return result as FormState;
    },
    null
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
          />
        }
      >
        <ServerCog className="size-3.5" aria-hidden="true" />
        추가
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-stone-800">시스템 정보 추가</DialogTitle>
          <DialogDescription>접속 정보 및 시스템 상세를 입력하세요.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="customerId" value={customerId} />

          {/* 시스템명 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="si-name" className="text-stone-700">시스템명 <span className="text-rose-500">*</span></Label>
            <Input id="si-name" name="name" placeholder="예: 운영 DB 서버" required />
            {getFieldError(state, "name") && <p className="text-xs text-rose-500">{getFieldError(state, "name")}</p>}
          </div>

          {/* 유형 / 환경 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="si-assetType" className="text-stone-700">유형 <span className="text-rose-500">*</span></Label>
              <select
                id="si-assetType"
                name="assetType"
                defaultValue="SERVER"
                className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {ASSET_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="si-serviceEnv" className="text-stone-700">환경 <span className="text-rose-500">*</span></Label>
              <select
                id="si-serviceEnv"
                name="serviceEnv"
                defaultValue="PRODUCTION"
                className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {SERVICE_ENV_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 호스트 / 포트 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="si-host" className="text-stone-700">호스트 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
              <Input id="si-host" name="host" placeholder="192.168.0.1" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="si-port" className="text-stone-700">포트 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
              <Input id="si-port" name="port" type="number" placeholder="3306" min={1} max={65535} />
              {getFieldError(state, "port") && <p className="text-xs text-rose-500">{getFieldError(state, "port")}</p>}
            </div>
          </div>

          {/* 아이디 / 비밀번호 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="si-username" className="text-stone-700">아이디 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
              <Input id="si-username" name="username" placeholder="root" autoComplete="off" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="si-password" className="text-stone-700">비밀번호 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
              <Input id="si-password" name="passwordHash" type="password" placeholder="••••••••" autoComplete="new-password" />
            </div>
          </div>

          {/* 설명 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="si-description" className="text-stone-700">설명 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
            <textarea
              id="si-description"
              name="description"
              rows={2}
              placeholder="시스템에 대한 간략한 설명"
              className="w-full resize-none rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {getStringError(state) && (
            <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{getStringError(state)}</p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-teal-600 text-white hover:bg-teal-500"
            >
              {isPending ? (
                <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />저장 중...</>
              ) : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
