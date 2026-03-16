"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCustomer } from "@/domains/customer/actions/customer.actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2 } from "lucide-react";
import { IndustryType, ContractStatus } from "@prisma/client";
import { type FieldErrors, getFieldError, getStringError } from "@/shared/lib/form";

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

// createCustomer는 성공 시 customerId를 반환하므로 로컬 확장 타입 사용
type CustomerFormState =
  | { success: true; customerId: string }
  | { success: false; error: string | FieldErrors }
  | null;

export function CustomerForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<CustomerFormState, FormData>(
    async (_prev, formData) => {
      const result = await createCustomer(formData);
      return (result ?? null) as CustomerFormState;
    },
    null
  );

  useEffect(() => {
    if (state?.success && state.customerId) {
      toast.success("고객사가 등록되었습니다.");
      router.push(`/customers/${state.customerId}`);
    }
  }, [state, router]);

  const nameError = getFieldError(state, "name");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* 고객사명 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-stone-700">
          고객사명 <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="예: (주)테스트컴퍼니"
          required
          aria-required="true"
          aria-describedby={nameError ? "name-error" : undefined}
          aria-invalid={nameError ? true : undefined}
        />
        {nameError && (
          <p id="name-error" role="alert" className="text-xs text-rose-500">{nameError}</p>
        )}
      </div>

      {/* 업종 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="industryType" className="text-stone-700">
          업종 <span className="text-rose-500">*</span>
        </Label>
        <select
          id="industryType"
          name="industryType"
          defaultValue="OTHER"
          className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-required="true"
        >
          {INDUSTRY_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 계약 상태 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contractStatus" className="text-stone-700">
          계약 상태 <span className="text-rose-500">*</span>
        </Label>
        <select
          id="contractStatus"
          name="contractStatus"
          defaultValue="ACTIVE"
          className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-required="true"
        >
          {CONTRACT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
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
          placeholder="고객사에 대한 간략한 설명을 입력하세요"
          rows={3}
          className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      {/* 서버 에러 */}
      {getStringError(state) && (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {getStringError(state)}
        </p>
      )}

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-teal-600 text-white hover:bg-teal-500"
        >
          {isPending ? (
            <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />등록 중...</>
          ) : "고객사 등록"}
        </Button>
      </div>
    </form>
  );
}
