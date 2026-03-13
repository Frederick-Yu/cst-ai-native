"use client";

import { useState, useActionState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStakeholder } from "@/actions/stakeholder.actions";
import { StakeholderRole } from "@prisma/client";

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

type FormState = { success?: boolean; error?: string | Record<string, string[]> } | null;

export function EditStakeholderDialog({ stakeholder }: { stakeholder: StakeholderData }) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await updateStakeholder(formData);
      if (result.success) {
        setOpen(false);
        return { success: true };
      }
      return result;
    },
    null
  );

  function getFieldError(field: string) {
    if (state?.error && typeof state.error === "object") {
      return (state.error as Record<string, string[]>)[field]?.[0];
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <DialogHeader>
          <DialogTitle className="text-stone-800">담당자 수정</DialogTitle>
          <DialogDescription>수정 내용과 변경 사유를 입력하세요.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="stakeholderId" value={stakeholder.id} />
          <input type="hidden" name="customerId" value={stakeholder.customerId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="esh-name" className="text-stone-700">이름 <span className="text-rose-500">*</span></Label>
            <Input id="esh-name" name="name" defaultValue={stakeholder.name} required />
            {getFieldError("name") && <p className="text-xs text-rose-500">{getFieldError("name")}</p>}
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
            {getFieldError("email") && <p className="text-xs text-rose-500">{getFieldError("email")}</p>}
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
            {getFieldError("change_reason") && (
              <p className="text-xs text-rose-500">{getFieldError("change_reason")}</p>
            )}
          </div>

          {state?.error && typeof state.error === "string" && (
            <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-teal-600 text-white hover:bg-teal-500"
            >
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
