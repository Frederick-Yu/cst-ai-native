"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { signUp } from "@/actions/auth.actions";

type FormState = { success?: boolean; error?: string | Record<string, string[]> } | null;

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await signUp(formData);
      return result ?? null;
    },
    null
  );

  function getFieldError(field: string) {
    if (state?.error && typeof state.error === "object") {
      return (state.error as Record<string, string[]>)[field]?.[0];
    }
  }

  return (
    <Card className="w-full max-w-sm bg-stone-900 ring-stone-700">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-teal-400" aria-hidden="true" />
          <CardTitle className="text-stone-100">회원가입</CardTitle>
        </div>
        <CardDescription className="text-stone-400">
          계정을 생성하면 관리자 승인 후 전체 기능을 사용할 수 있습니다.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="signup-form" aria-label="회원가입 폼" action={formAction} className="flex flex-col gap-4">
          {/* 이름 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-stone-300">이름</Label>
            <Input
              id="name"
              name="name"
              placeholder="홍길동"
              required
              aria-required="true"
              className="border-stone-700 bg-stone-800 text-stone-100 placeholder:text-stone-500"
            />
            {getFieldError("name") && (
              <p className="text-xs text-rose-400">{getFieldError("name")}</p>
            )}
          </div>

          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-stone-300">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="hong@example.com"
              required
              aria-required="true"
              className="border-stone-700 bg-stone-800 text-stone-100 placeholder:text-stone-500"
            />
            {getFieldError("email") && (
              <p className="text-xs text-rose-400">{getFieldError("email")}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-stone-300">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="8자 이상"
              required
              aria-required="true"
              className="border-stone-700 bg-stone-800 text-stone-100 placeholder:text-stone-500"
            />
            {getFieldError("password") && (
              <p className="text-xs text-rose-400">{getFieldError("password")}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword" className="text-stone-300">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              aria-required="true"
              className="border-stone-700 bg-stone-800 text-stone-100 placeholder:text-stone-500"
            />
            {getFieldError("confirmPassword") && (
              <p className="text-xs text-rose-400">{getFieldError("confirmPassword")}</p>
            )}
          </div>

          {state?.error && typeof state.error === "string" && (
            <p role="alert" className="rounded-md bg-rose-900/40 px-3 py-2 text-sm text-rose-300">
              {state.error}
            </p>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t-0 bg-transparent">
        <Button
          type="submit"
          form="signup-form"
          disabled={isPending}
          className="w-full bg-teal-600 text-white hover:bg-teal-500"
          size="lg"
        >
          {isPending ? "가입 중..." : "회원가입"}
        </Button>
        <p className="text-sm text-stone-400">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-teal-400 hover:underline">
            로그인
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
