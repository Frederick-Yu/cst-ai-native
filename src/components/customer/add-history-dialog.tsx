"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHistory } from "@/actions/history.actions";
import { EventType } from "@prisma/client";
import { toast } from "sonner";
import { type FormState, getFieldError, getStringError } from "@/lib/form";

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "INSTALLATION", label: "구축" },
  { value: "MAINTENANCE", label: "유지보수" },
  { value: "INCIDENT", label: "장애" },
  { value: "UPDATE", label: "업데이트" },
  { value: "MEETING", label: "미팅" },
  { value: "OTHER", label: "기타" },
];

export function AddHistoryDialog({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await createHistory(formData);
      if (result.success) {
        setOpen(false);
        toast.success("이력이 등록되었습니다");
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
        <PlusCircle className="size-3.5" aria-hidden="true" />
        이력 추가
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-stone-800">이력 추가</DialogTitle>
          <DialogDescription>새로운 작업 이력을 등록합니다.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="customerId" value={customerId} />

          {/* 유형 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hi-eventType" className="text-stone-700">이벤트 유형 <span className="text-rose-500">*</span></Label>
            <select
              id="hi-eventType"
              name="eventType"
              defaultValue="MAINTENANCE"
              className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hi-title" className="text-stone-700">제목 <span className="text-rose-500">*</span></Label>
            <Input id="hi-title" name="title" placeholder="예: 정기 서버 점검" required />
            {getFieldError(state, "title") && <p className="text-xs text-rose-500">{getFieldError(state, "title")}</p>}
          </div>

          {/* 내용 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hi-content" className="text-stone-700">내용 <span className="text-rose-500">*</span></Label>
            <textarea
              id="hi-content"
              name="content"
              rows={4}
              required
              placeholder="작업 내용을 상세히 입력하세요"
              className="w-full resize-none rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {getFieldError(state, "content") && <p className="text-xs text-rose-500">{getFieldError(state, "content")}</p>}
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
