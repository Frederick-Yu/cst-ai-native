"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer } from "@/actions/customer.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndustryType, ContractStatus } from "@prisma/client";

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

type FormState = {
  error?: string | Record<string, string[]>;
} | null;

export function CustomerForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await createCustomer(formData);
      return result ?? null;
    },
    null
  );

  function getFieldError(field: string): string | undefined {
    if (state?.error && typeof state.error === "object") {
      const errors = (state.error as Record<string, string[]>)[field];
      return errors?.[0];
    }
  }

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
        />
        {getFieldError("name") && (
          <p className="text-xs text-rose-500">{getFieldError("name")}</p>
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
      {state?.error && typeof state.error === "string" && (
        <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {state.error}
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
          {isPending ? "등록 중..." : "고객사 등록"}
        </Button>
      </div>
    </form>
  );
}
