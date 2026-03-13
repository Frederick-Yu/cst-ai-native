"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm bg-stone-900 ring-stone-700">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-teal-400" aria-hidden="true" />
          <CardTitle className="text-stone-100">로그인</CardTitle>
        </div>
        <CardDescription className="text-stone-400">
          Customer Success Tracker에 오신 것을 환영합니다.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {registered && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-teal-900/40 px-3 py-2 text-sm text-teal-300">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            회원가입이 완료되었습니다. 로그인해주세요.
          </div>
        )}

        <form id="login-form" aria-label="로그인 폼" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-stone-300">이메일</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              className="border-stone-700 bg-stone-800 text-stone-100 placeholder:text-stone-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-stone-300">비밀번호</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              className="border-stone-700 bg-stone-800 text-stone-100 placeholder:text-stone-500"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-rose-900/40 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          form="login-form"
          disabled={isLoading}
          className="w-full bg-teal-600 text-white hover:bg-teal-500"
          size="lg"
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </Button>
        <p className="text-sm text-stone-400">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-teal-400 hover:underline">
            회원가입
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
