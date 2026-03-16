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
import { updateHistory, deleteHistory } from "@/domains/customer/actions/history.actions";
import { EventType } from "@prisma/client";
import { toast } from "sonner";
import { type FormState, getFieldError, getStringError } from "@/shared/lib/form";

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "INSTALLATION", label: "구축" },
  { value: "MAINTENANCE", label: "유지보수" },
  { value: "INCIDENT", label: "장애" },
  { value: "UPDATE", label: "업데이트" },
  { value: "MEETING", label: "미팅" },
  { value: "OTHER", label: "기타" },
];

interface HistoryData {
  id: string;
  customerId: string;
  eventType: EventType;
  title: string;
  content: string;
}

export function EditHistoryDialog({ history }: { history: HistoryData }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | "delete">("edit");
  const router = useRouter();

  const [editState, editFormAction, isEditPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await updateHistory(formData);
      if (result.success) {
        setOpen(false);
        toast.success("이력이 수정되었습니다");
        router.refresh();
        return { success: true };
      }
      return result as FormState;
    },
    null
  );

  const [deleteState, deleteFormAction, isDeletePending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await deleteHistory(formData);
      if (result.success) {
        setOpen(false);
        toast.success("이력이 삭제되었습니다");
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
            aria-label="이력 수정"
          />
        }
      >
        <Pencil className="size-3" aria-hidden="true" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {mode === "edit" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-stone-800">이력 수정</DialogTitle>
              <DialogDescription>수정 내용과 변경 사유를 입력하세요.</DialogDescription>
            </DialogHeader>

            <form action={editFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="historyId" value={history.id} />
              <input type="hidden" name="customerId" value={history.customerId} />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ehi-eventType" className="text-stone-700">이벤트 유형 <span className="text-rose-500">*</span></Label>
                <select
                  id="ehi-eventType"
                  name="eventType"
                  defaultValue={history.eventType}
                  className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {EVENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ehi-title" className="text-stone-700">제목 <span className="text-rose-500">*</span></Label>
                <Input id="ehi-title" name="title" defaultValue={history.title} required />
                {getFieldError(editState, "title") && (
                  <p className="text-xs text-rose-500">{getFieldError(editState, "title")}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ehi-content" className="text-stone-700">내용 <span className="text-rose-500">*</span></Label>
                <textarea
                  id="ehi-content"
                  name="content"
                  rows={4}
                  defaultValue={history.content}
                  required
                  className="w-full resize-none rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {getFieldError(editState, "content") && (
                  <p className="text-xs text-rose-500">{getFieldError(editState, "content")}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ehi-reason" className="text-stone-700">
                  변경 사유 <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="ehi-reason"
                  name="change_reason"
                  placeholder="변경 사유를 5자 이상 입력하세요"
                  required
                />
                {getFieldError(editState, "change_reason") && (
                  <p className="text-xs text-rose-500">{getFieldError(editState, "change_reason")}</p>
                )}
              </div>

              {getStringError(editState) && (
                <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {getStringError(editState)}
                </p>
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
              <DialogTitle className="text-rose-600">이력 삭제</DialogTitle>
              <DialogDescription>
                <span className="font-medium text-stone-700">{history.title}</span> 이력을 삭제합니다.
                이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>

            <form action={deleteFormAction} className="flex flex-col gap-4">
              <input type="hidden" name="historyId" value={history.id} />
              <input type="hidden" name="customerId" value={history.customerId} />
              <input type="hidden" name="historyTitle" value={history.title} />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ehi-delete-reason" className="text-stone-700">
                  삭제 사유 <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="ehi-delete-reason"
                  name="change_reason"
                  placeholder="삭제 사유를 5자 이상 입력하세요"
                  required
                />
                {getFieldError(deleteState, "change_reason") && (
                  <p className="text-xs text-rose-500">{getFieldError(deleteState, "change_reason")}</p>
                )}
              </div>

              {getStringError(deleteState) && (
                <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {getStringError(deleteState)}
                </p>
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
