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
import { updateStakeholder, deleteStakeholder } from "@/domains/customer/actions/stakeholder.actions";
import { StakeholderRole } from "@prisma/client";
import { toast } from "sonner";
import { type FormState, getFieldError, getStringError } from "@/shared/lib/form";

const ROLE_OPTIONS: { value: StakeholderRole; label: string }[] = [
  { value: "CONTACT", label: "담당자" },
  { value: "MANAGER", label: "관리자" },
  { value: "TECHNICAL", label: "기술담당" },
  { value: "EXECUTIVE", label: "임원" },
];

interface StakeholderData {
  id: string;
  customerId: string;
  name: string;
  role: StakeholderRole;
  email: string | null;
  phone: string | null;
}

export function EditStakeholderDialog({ stakeholder }: { stakeholder: StakeholderData }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | "delete">("edit");
  const router = useRouter();

  const [editState, editFormAction, isEditPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await updateStakeholder(formData);
      if (result.success) {
        setOpen(false);
        toast.success("담당자 정보가 수정되었습니다");
        router.refresh();
        return { success: true };
      }
      return result as FormState;
    },
    null
  );

  const [deleteState, deleteFormAction, isDeletePending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await deleteStakeholder(formData);
      if (result.success) {
        setOpen(false);
        toast.success("담당자가 삭제되었습니다");
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
            aria-label="담당자 수정"
          />
        }
      >
        <Pencil className="size-3" aria-hidden="true" />
      </DialogTrigger>

      <DialogContent>
        {mode === "edit" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-stone-800">담당자 수정</DialogTitle>
              <DialogDescription>수정 내용과 변경 사유를 입력하세요.</DialogDescription>
            </DialogHeader>

            <form action={editFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="stakeholderId" value={stakeholder.id} />
              <input type="hidden" name="customerId" value={stakeholder.customerId} />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="esh-name" className="text-stone-700">이름 <span className="text-rose-500">*</span></Label>
                <Input id="esh-name" name="name" defaultValue={stakeholder.name} required />
                {getFieldError(editState, "name") && <p className="text-xs text-rose-500">{getFieldError(editState, "name")}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="esh-role" className="text-stone-700">역할 <span className="text-rose-500">*</span></Label>
                <select
                  id="esh-role"
                  name="role"
                  defaultValue={stakeholder.role}
                  className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="esh-email" className="text-stone-700">이메일 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
                <Input id="esh-email" name="email" type="email" defaultValue={stakeholder.email ?? ""} />
                {getFieldError(editState, "email") && <p className="text-xs text-rose-500">{getFieldError(editState, "email")}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="esh-phone" className="text-stone-700">전화번호 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
                <Input id="esh-phone" name="phone" defaultValue={stakeholder.phone ?? ""} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="esh-reason" className="text-stone-700">
                  변경 사유 <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="esh-reason"
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
              <DialogTitle className="text-rose-600">담당자 삭제</DialogTitle>
              <DialogDescription>
                <span className="font-medium text-stone-700">{stakeholder.name}</span> 담당자를 삭제합니다.
                이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>

            <form action={deleteFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="stakeholderId" value={stakeholder.id} />
              <input type="hidden" name="customerId" value={stakeholder.customerId} />
              <input type="hidden" name="stakeholderName" value={stakeholder.name} />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="esh-delete-reason" className="text-stone-700">
                  삭제 사유 <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="esh-delete-reason"
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
