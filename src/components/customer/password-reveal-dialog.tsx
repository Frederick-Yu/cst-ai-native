"use client";

import { useState, useTransition } from "react";
import { ShieldAlert, Eye, EyeOff, Copy, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revealPassword } from "@/actions/audit.actions";

interface PasswordRevealDialogProps {
  systemInfoId: string;
  systemInfoName: string;
}

export function PasswordRevealDialog({ systemInfoId, systemInfoName }: PasswordRevealDialogProps) {
  const [open, setOpen] = useState(false);
  const [accessReason, setAccessReason] = useState("");
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setAccessReason("");
      setRevealedPassword(null);
      setShowPassword(false);
      setCopied(false);
      setError(null);
    }
  }

  function handleReveal() {
    setError(null);
    startTransition(async () => {
      const result = await revealPassword(systemInfoId, accessReason);
      if (result.success) {
        setRevealedPassword(result.passwordHash);
      } else {
        if (typeof result.error === "string") {
          setError(result.error);
        } else {
          setError(Object.values(result.error).flat().join(", "));
        }
      }
    });
  }

  async function handleCopy() {
    if (!revealedPassword) return;
    await navigator.clipboard.writeText(revealedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          />
        }
      >
        <ShieldAlert className="size-3.5" aria-hidden="true" />
        비밀번호 보기
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-stone-800">
            <ShieldAlert className="size-4 text-rose-500" aria-hidden="true" />
            비밀번호 조회
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-stone-700">{systemInfoName}</span>의 비밀번호를 조회합니다.
            보안 감사를 위해 조회 사유를 입력해야 합니다.
          </DialogDescription>
        </DialogHeader>

        {!revealedPassword ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="access-reason" className="text-stone-700">
                조회 사유 <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="access-reason"
                placeholder="조회 사유를 5자 이상 입력해주세요"
                value={accessReason}
                onChange={(e) => setAccessReason(e.target.value)}
                aria-required="true"
              />
            </div>
            {error && (
              <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button
                onClick={handleReveal}
                disabled={isPending || accessReason.length < 5}
                className="bg-rose-600 text-white hover:bg-rose-700"
              >
                {isPending ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />조회 중...</>
                ) : "조회"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-stone-500">
              조회 이력이 감사 로그에 기록되었습니다.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
              <code className="flex-1 text-sm text-stone-800">
                {showPassword ? revealedPassword : "••••••••••••"}
              </code>
              <button
                onClick={() => setShowPassword((v) => !v)}
                className="text-stone-400 hover:text-stone-700"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
              <button
                onClick={handleCopy}
                className="text-stone-400 hover:text-teal-600"
                aria-label="클립보드에 복사"
              >
                {copied ? <Check className="size-4 text-teal-600" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
