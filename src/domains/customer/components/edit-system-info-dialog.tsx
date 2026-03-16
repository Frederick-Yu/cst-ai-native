"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { updateSystemInfo, deleteSystemInfo } from "@/domains/customer/actions/system-info.actions";
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

interface SystemInfoData {
  id: string;
  customerId: string;
  name: string;
  assetType: AssetType;
  serviceEnv: ServiceEnv;
  description: string | null;
  host: string | null;
  port: number | null;
  username: string | null;
}

export function EditSystemInfoDialog({ systemInfo }: { systemInfo: SystemInfoData }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | "delete">("edit");
  const router = useRouter();

  const [editState, editFormAction, isEditPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await updateSystemInfo(formData);
      if (result.success) {
        setOpen(false);
        toast.success("시스템 정보가 수정되었습니다");
        router.refresh();
        return { success: true };
      }
      return result as FormState;
    },
    null
  );

  const [deleteState, deleteFormAction, isDeletePending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await deleteSystemInfo(formData);
      if (result.success) {
        setOpen(false);
        toast.success("시스템 정보가 삭제되었습니다");
        router.refresh();
        return { success: true };
      }
      return result as FormState;
    },
    null
  );

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setMode("edit");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="size-6 p-0 text-stone-400 hover:text-teal-600 hover:bg-teal-50"
            aria-label="시스템 정보 수정"
          />
        }
      >
        <Pencil className="size-3" aria-hidden="true" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {mode === "edit" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-stone-800">시스템 정보 수정</DialogTitle>
              <DialogDescription>수정 내용과 변경 사유를 입력하세요.</DialogDescription>
            </DialogHeader>

            <form action={editFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="systemInfoId" value={systemInfo.id} />
              <input type="hidden" name="customerId" value={systemInfo.customerId} />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="esi-name" className="text-stone-700">시스템명 <span className="text-rose-500">*</span></Label>
                <Input id="esi-name" name="name" defaultValue={systemInfo.name} required />
                {getFieldError(editState, "name") && <p className="text-xs text-rose-500">{getFieldError(editState, "name")}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="esi-assetType" className="text-stone-700">유형 <span className="text-rose-500">*</span></Label>
                  <select
                    id="esi-assetType"
                    name="assetType"
                    defaultValue={systemInfo.assetType}
                    className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {ASSET_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="esi-serviceEnv" className="text-stone-700">환경 <span className="text-rose-500">*</span></Label>
                  <select
                    id="esi-serviceEnv"
                    name="serviceEnv"
                    defaultValue={systemInfo.serviceEnv}
                    className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {SERVICE_ENV_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="esi-host" className="text-stone-700">호스트 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
                  <Input id="esi-host" name="host" defaultValue={systemInfo.host ?? ""} placeholder="192.168.0.1" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="esi-port" className="text-stone-700">포트 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
                  <Input
                    id="esi-port"
                    name="port"
                    type="number"
                    defaultValue={systemInfo.port ?? ""}
                    placeholder="3306"
                    min={1}
                    max={65535}
                  />
                  {getFieldError(editState, "port") && <p className="text-xs text-rose-500">{getFieldError(editState, "port")}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="esi-username" className="text-stone-700">아이디 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
                  <Input id="esi-username" name="username" defaultValue={systemInfo.username ?? ""} autoComplete="off" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="esi-password" className="text-stone-700">
                    비밀번호 <span className="text-xs font-normal text-stone-400">(변경 시만 입력)</span>
                  </Label>
                  <Input id="esi-password" name="passwordHash" type="password" placeholder="변경 시만 입력" autoComplete="new-password" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="esi-description" className="text-stone-700">설명 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
                <textarea
                  id="esi-description"
                  name="description"
                  rows={2}
                  defaultValue={systemInfo.description ?? ""}
                  placeholder="시스템에 대한 간략한 설명"
                  className="w-full resize-none rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="esi-reason" className="text-stone-700">
                  변경 사유 <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="esi-reason"
                  name="change_reason"
                  placeholder="변경 사유를 5자 이상 입력하세요"
                  required
                />
                {getFieldError(editState, "change_reason") && (
                  <p className="text-xs text-rose-500">{getFieldError(editState, "change_reason")}</p>
                )}
              </div>

              {getStringError(editState) && (
                <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{getStringError(editState)}</p>
              )}

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mr-auto text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => setMode("delete")}
                >
                  <Trash2 className="mr-1.5 size-3.5" aria-hidden="true" />
                  삭제
                </Button>
                <Button
                  type="submit"
                  disabled={isEditPending}
                  className="bg-teal-600 text-white hover:bg-teal-500"
                >
                  {isEditPending ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />저장 중...</>
                  ) : "저장"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-rose-600">시스템 정보 삭제</DialogTitle>
              <DialogDescription>
                <span className="font-medium text-stone-700">{systemInfo.name}</span> 시스템 정보를 삭제합니다.
                이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>

            <form action={deleteFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="systemInfoId" value={systemInfo.id} />
              <input type="hidden" name="customerId" value={systemInfo.customerId} />
              <input type="hidden" name="systemInfoName" value={systemInfo.name} />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="esi-delete-reason" className="text-stone-700">
                  삭제 사유 <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="esi-delete-reason"
                  name="change_reason"
                  placeholder="삭제 사유를 5자 이상 입력하세요"
                  required
                />
                {getFieldError(deleteState, "change_reason") && (
                  <p className="text-xs text-rose-500">{getFieldError(deleteState, "change_reason")}</p>
                )}
              </div>

              {getStringError(deleteState) && (
                <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{getStringError(deleteState)}</p>
              )}

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode("edit")}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isDeletePending}
                  className="bg-rose-600 text-white hover:bg-rose-500"
                >
                  {isDeletePending ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />삭제 중...</>
                  ) : "삭제 확인"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
