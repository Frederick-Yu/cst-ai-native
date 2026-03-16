"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { updateCustomer, deleteCustomer } from "@/domains/customer/actions/customer.actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { IndustryType, ContractStatus } from "@prisma/client";
import { type FormState, getFieldError, getStringError } from "@/shared/lib/form";

const INDUSTRY_TYPE_OPTIONS: { value: IndustryType; label: string }[] = [
  { value: "FINANCE", label: "금융" },
  { value: "HEALTHCARE", label: "의료" },
  { value: "RETAIL", label: "유통" },
  { value: "MANUFACTURING", label: "제조" },
  { value: "IT", label: "IT" },
  { value: "OTHER", label: "기타" },
];

const CONTRACT_STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
  { value: "ACTIVE", label: "계약 중" },
  { value: "PENDING", label: "대기" },
  { value: "INACTIVE", label: "비활성" },
  { value: "TERMINATED", label: "종료" },
];

interface CustomerEditFormProps {
  customer: {
    id: string;
    name: string;
    industryType: IndustryType;
    contractStatus: ContractStatus;
    description: string | null;
  };
}

export function CustomerEditForm({ customer }: CustomerEditFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"edit" | "delete">("edit");

  const [editState, editFormAction, isEditPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await updateCustomer(formData);
      return (result ?? null) as FormState;
    },
    null
  );

  const [deleteState, deleteFormAction, isDeletePending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await deleteCustomer(formData);
      return (result ?? null) as FormState;
    },
    null
  );

  if (mode === "delete") {
    return (
      <form action={deleteFormAction} className="flex flex-col gap-5">
        <input type="hidden" name="customerId" value={customer.id} />
        <input type="hidden" name="customerName" value={customer.name} />

        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <p className="font-medium">고객사를 삭제하시겠습니까?</p>
          <p className="mt-1 text-rose-600">
            <span className="font-semibold">{customer.name}</span>의 모든 데이터(담당자, 시스템 정보, 이력)가
            영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="delete_reason" className="text-stone-700">
            삭제 사유 <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="delete_reason"
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

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setMode("edit")}
            disabled={isDeletePending}
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isDeletePending}
            className="flex-1 bg-rose-600 text-white hover:bg-rose-500"
          >
            {isDeletePending ? (
              <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />삭제 중...</>
            ) : "삭제 확인"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form action={editFormAction} className="flex flex-col gap-5">
      <input type="hidden" name="customerId" value={customer.id} />

      {/* 고객사명 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-stone-700">
          고객사명 <span className="text-rose-500">*</span>
        </Label>
        <Input id="name" name="name" defaultValue={customer.name} required />
        {getFieldError(editState, "name") && <p className="text-xs text-rose-500">{getFieldError(editState, "name")}</p>}
      </div>

      {/* 업종 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="industryType" className="text-stone-700">업종</Label>
        <select
          id="industryType"
          name="industryType"
          defaultValue={customer.industryType}
          className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {INDUSTRY_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 계약 상태 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contractStatus" className="text-stone-700">계약 상태</Label>
        <select
          id="contractStatus"
          name="contractStatus"
          defaultValue={customer.contractStatus}
          className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {CONTRACT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 설명 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description" className="text-stone-700">
          설명 <span className="text-xs font-normal text-stone-400">(선택)</span>
        </Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={customer.description ?? ""}
          className="w-full resize-none rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* 변경 사유 (Audit Log 필수) */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="change_reason" className="text-stone-700">
          변경 사유 <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="change_reason"
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

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mr-auto text-rose-500 hover:bg-rose-50 hover:text-rose-600"
          onClick={() => setMode("delete")}
          disabled={isEditPending}
        >
          <Trash2 className="mr-1.5 size-3.5" aria-hidden="true" />
          삭제
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isEditPending}
        >
          취소
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
      </div>
    </form>
  );
}
