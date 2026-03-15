"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStakeholder } from "@/actions/stakeholder.actions";
import { StakeholderRole } from "@prisma/client";
import { toast } from "sonner";
import { type FormState, getFieldError, getStringError } from "@/lib/form";

const ROLE_OPTIONS: { value: StakeholderRole; label: string }[] = [
  { value: "CONTACT", label: "담당자" },
  { value: "MANAGER", label: "관리자" },
  { value: "TECHNICAL", label: "기술담당" },
  { value: "EXECUTIVE", label: "임원" },
];

export function AddStakeholderDialog({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await createStakeholder(formData);
      if (result.success) {
        setOpen(false);
        toast.success("담당자가 추가되었습니다");
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
        <UserPlus className="size-3.5" aria-hidden="true" />
        추가
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-stone-800">담당자 추가</DialogTitle>
          <DialogDescription>새로운 담당자 정보를 입력하세요.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="customerId" value={customerId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sh-name" className="text-stone-700">이름 <span className="text-rose-500">*</span></Label>
            <Input id="sh-name" name="name" placeholder="홍길동" required />
            {getFieldError(state, "name") && <p className="text-xs text-rose-500">{getFieldError(state, "name")}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sh-role" className="text-stone-700">역할 <span className="text-rose-500">*</span></Label>
            <select
              id="sh-role"
              name="role"
              defaultValue="CONTACT"
              className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sh-email" className="text-stone-700">이메일 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
            <Input id="sh-email" name="email" type="email" placeholder="hong@example.com" />
            {getFieldError(state, "email") && <p className="text-xs text-rose-500">{getFieldError(state, "email")}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sh-phone" className="text-stone-700">전화번호 <span className="text-xs font-normal text-stone-400">(선택)</span></Label>
            <Input id="sh-phone" name="phone" placeholder="010-0000-0000" />
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
