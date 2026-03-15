# Phase 3 — 핵심 기능 구현 (D+3 ~ D+6)

**목표:** 핵심 기능 구현 완성
**완료 기준:** 6개 핵심 기능 모두 동작, Audit Log 트랜잭션 검증됨

---

## 체크리스트

- [x] 고객사 목록 Server Component (검색 포함)
- [x] 고객사 상세 페이지 (타임라인·접속 정보)
- [x] 고객사 생성 Server Action (Zod 검증 + change_reason)
- [x] 고객사 수정 Server Action (Zod 검증 + Audit Log 트랜잭션)
- [x] 비밀번호 마스킹 컴포넌트
- [x] 비밀번호 조회 팝업 (access_reason 강제 입력)
- [x] Audit Log 기록 Service 함수
- [x] Audit Log 열람 페이지 (관리자 전용)
- [x] Skeleton UI 적용 (목록·상세 페이지)
- [x] 커밋: `feat: 고객사 CRUD 및 비밀번호 조회 Audit Log 기록 기능 추가`

> **✅ 완료** — 2026-03-13

---

## 1. 고객사 목록 페이지 (Server Component)

`src/app/customers/page.tsx`:
```typescript
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerList } from "@/components/customer/customer-list";
import { CustomerSearch } from "@/components/customer/customer-search";

interface PageProps {
  searchParams: { q?: string };
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const customers = await prisma.customer.findMany({
    where: searchParams.q
      ? {
          OR: [
            { customerName: { contains: searchParams.q, mode: "insensitive" } },
            { techStack: { has: searchParams.q } },
          ],
        }
      : undefined,
    include: {
      stakeholders: { where: { isActive: true, roleType: "MAIN_MAINTAINER" } },
      _count: { select: { histories: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-stone-900">고객사 목록</h1>
        <CustomerSearch defaultValue={searchParams.q} />
      </div>
      <CustomerList customers={customers} />
    </div>
  );
}
```

### Skeleton Fallback

`src/app/customers/loading.tsx`:
```typescript
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
```

---

## 2. Audit Service (핵심 비즈니스 로직)

`src/lib/audit.ts`:
```typescript
import { prisma } from "@/lib/prisma";
import { ActionType } from "@prisma/client";
import { headers } from "next/headers";

interface CreateAuditLogParams {
  userId: string;
  actionType: ActionType;
  targetData: string;
  accessReason: string;
}

/**
 * Audit Log를 생성하는 Prisma 쿼리를 반환한다.
 * 반드시 $transaction 안에서 사용해야 한다.
 */
export function createAuditLogQuery(params: CreateAuditLogParams) {
  const headersList = headers();
  const clientIp =
    headersList.get("x-forwarded-for")?.split(",")[0] ??
    headersList.get("x-real-ip") ??
    "unknown";

  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      actionType: params.actionType,
      targetData: params.targetData,
      accessReason: params.accessReason,
      clientIp,
    },
  });
}
```

---

## 3. 고객사 Server Actions

`src/actions/customer.actions.ts`:
```typescript
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLogQuery } from "@/lib/audit";

// ── Zod 스키마 ──────────────────────────────────────────

const CreateCustomerSchema = z.object({
  customerName: z.string().min(1, "고객사명은 필수입니다"),
  industryType: z.enum(["MANUFACTURING", "FINANCE", "PUBLIC", "DISTRIBUTION", "OTHER"]).optional(),
  contractStatus: z.enum(["IN_PROGRESS", "MAINTENANCE", "EXPIRED"]).default("IN_PROGRESS"),
  techStack: z.string().optional(), // 콤마 구분 문자열 → 배열 변환
  change_reason: z.string().min(5, "변경 사유는 5자 이상 입력해야 합니다"),
});

const UpdateCustomerSchema = CreateCustomerSchema.extend({
  customerId: z.string().min(1),
});

// ── Actions ──────────────────────────────────────────────

export async function createCustomer(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const parsed = CreateCustomerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { customerName, industryType, contractStatus, techStack, change_reason } = parsed.data;

  try {
    const customer = await prisma.customer.create({
      data: {
        customerCode: await generateCustomerCode(),
        customerName,
        industryType,
        contractStatus,
        techStack: techStack ? techStack.split(",").map((s) => s.trim()) : [],
      },
    });

    // CREATE 이벤트도 Audit Log에 기록
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        actionType: "CREATE",
        targetData: `Customer:${customer.id} (${customerName})`,
        accessReason: change_reason,
      },
    });

    revalidatePath("/customers");
    return { success: true, customerId: customer.id };
  } catch {
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}

export async function updateCustomer(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const parsed = UpdateCustomerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { customerId, customerName, industryType, contractStatus, techStack, change_reason } = parsed.data;

  try {
    // 수정 + Audit Log를 트랜잭션으로 묶어 원자성 보장
    await prisma.$transaction([
      prisma.customer.update({
        where: { id: customerId },
        data: {
          customerName,
          industryType,
          contractStatus,
          techStack: techStack ? techStack.split(",").map((s) => s.trim()) : [],
        },
      }),
      createAuditLogQuery({
        userId: session.user.id,
        actionType: "UPDATE",
        targetData: `Customer:${customerId} (${customerName})`,
        accessReason: change_reason,
      }),
    ]);

    revalidatePath(`/customers/${customerId}`);
    revalidatePath("/customers");
    return { success: true };
  } catch {
    return { success: false, error: "수정 중 오류가 발생했습니다" };
  }
}

async function generateCustomerCode(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.customer.count();
  return `CUST-${year}-${String(count + 1).padStart(3, "0")}`;
}
```

---

## 4. 비밀번호 조회 Server Action

`src/actions/system-info.actions.ts`:
```typescript
"use server";

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLogQuery } from "@/lib/audit";

const ViewPasswordSchema = z.object({
  systemInfoId: z.string().min(1),
  access_reason: z.string().min(5, "조회 사유는 5자 이상 입력해야 합니다"),
});

/**
 * 비밀번호 조회 — 반드시 access_reason 입력 후 Audit Log 기록
 */
export async function viewPassword(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const parsed = ViewPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { systemInfoId, access_reason } = parsed.data;

  try {
    const systemInfo = await prisma.systemInfo.findUnique({
      where: { id: systemInfoId },
      select: { accessPwd: true, serviceUrl: true, customerId: true },
    });

    if (!systemInfo) return { success: false, error: "정보를 찾을 수 없습니다" };

    // Audit Log 기록 (조회 성공 시에만)
    await createAuditLogQuery({
      userId: session.user.id,
      actionType: "VIEW",
      targetData: `SystemInfo:${systemInfoId} 접속 비밀번호 (${systemInfo.serviceUrl ?? ""})`,
      accessReason: access_reason,
    });

    return { success: true, password: systemInfo.accessPwd };
  } catch {
    return { success: false, error: "조회 중 오류가 발생했습니다" };
  }
}
```

---

## 5. 비밀번호 조회 팝업 컴포넌트

`src/components/customer/password-reveal-dialog.tsx`:
```typescript
"use client";

import { useState } from "react";
import { viewPassword } from "@/actions/system-info.actions";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Copy, ShieldAlert } from "lucide-react";

interface PasswordRevealDialogProps {
  systemInfoId: string;
}

export function PasswordRevealDialog({ systemInfoId }: PasswordRevealDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleReveal() {
    if (reason.trim().length < 5) {
      setError("조회 사유는 5자 이상 입력해야 합니다");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("systemInfoId", systemInfoId);
    formData.set("access_reason", reason);

    const result = await viewPassword(formData);
    setLoading(false);

    if (!result.success) {
      setError(typeof result.error === "string" ? result.error : "오류가 발생했습니다");
      return;
    }
    setPassword(result.password ?? null);
  }

  async function handleCopy() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setOpen(false);
    setPassword(null);
    setReason("");
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-rose-200 text-rose-600 hover:bg-rose-50"
          aria-label="비밀번호 조회"
        >
          <ShieldAlert className="h-4 w-4 mr-1" />
          비밀번호 조회
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="h-5 w-5" />
            보안 정보 조회
          </DialogTitle>
        </DialogHeader>

        {!password ? (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              민감 정보 조회 이력이 기록됩니다. 조회 사유를 반드시 입력하세요.
            </p>
            <div className="space-y-2">
              <Label htmlFor="access-reason">조회 사유 *</Label>
              <Textarea
                id="access-reason"
                placeholder="예: 장애 대응을 위한 DB 접속 확인"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
              {error && <p className="text-sm text-rose-600" role="alert">{error}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>취소</Button>
              <Button
                onClick={handleReveal}
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Eye className="h-4 w-4 mr-1" />
                {loading ? "확인 중..." : "조회하기"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-stone-100 rounded-md p-3 font-mono text-sm break-all">
              {password}
            </div>
            <Button onClick={handleCopy} variant="outline" className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "복사됨!" : "클립보드에 복사"}
            </Button>
            <p className="text-xs text-stone-500 text-center">
              조회 이력이 보안 로그에 기록되었습니다.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 6. Audit Log 열람 페이지 (관리자 전용)

`src/app/admin/audit-logs/page.tsx`:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/customers");

  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const actionBadgeColor = {
    VIEW:   "bg-rose-100 text-rose-700",
    CREATE: "bg-teal-100 text-teal-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-stone-100 text-stone-700",
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">보안 감사 로그</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="보안 감사 로그 목록">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500">
              <th className="text-left py-3 px-4">일시</th>
              <th className="text-left py-3 px-4">수행자</th>
              <th className="text-left py-3 px-4">동작</th>
              <th className="text-left py-3 px-4">대상</th>
              <th className="text-left py-3 px-4">사유</th>
              <th className="text-left py-3 px-4">접속 IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                  {format(log.createdAt, "MM/dd HH:mm", { locale: ko })}
                </td>
                <td className="py-3 px-4">{log.user.name ?? log.user.email}</td>
                <td className="py-3 px-4">
                  <Badge className={actionBadgeColor[log.actionType]}>{log.actionType}</Badge>
                </td>
                <td className="py-3 px-4 text-stone-700">{log.targetData}</td>
                <td className="py-3 px-4 text-stone-600">{log.accessReason}</td>
                <td className="py-3 px-4 text-stone-500 font-mono text-xs">{log.clientIp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 완료 확인

| 기능 | 확인 방법 |
|------|-----------|
| 고객사 목록 조회 | `/customers` 접속 시 목록 렌더링 |
| 검색 | `?q=키워드` 파라미터로 필터링 동작 |
| 고객사 생성 | change_reason 없이 제출 시 Zod 에러 표시 |
| 고객사 수정 | 수정 후 AuditLog 테이블에 레코드 생성 확인 |
| 비밀번호 마스킹 | 목록·상세에서 `****` 표시 |
| 비밀번호 조회 팝업 | access_reason 5자 미만 시 버튼 차단 |
| Audit Log 기록 | 조회 성공 후 audit_logs 테이블 확인 |
| 관리자 로그 페이지 | MEMBER 계정으로 접근 시 리다이렉트 |
| Skeleton UI | 페이지 로딩 중 뼈대 표시 |

---

## 커밋 메시지

```
feat: 고객사 CRUD 및 비밀번호 조회 Audit Log 기록 기능 추가

- 고객사 목록/상세 Server Component 구현 (Skeleton 로딩 포함)
- createCustomer/updateCustomer Server Action (Zod + change_reason 필수 검증)
- viewPassword Server Action: access_reason 입력 후 $transaction으로 Audit Log 동시 기록
- PasswordRevealDialog 컴포넌트: Rose 계열 경고 UI + 클립보드 복사
- 관리자 전용 Audit Log 열람 페이지 (/admin/audit-logs)
```
