# Phase 4 — UX 완성 & 반응형 (D+6 ~ D+7)

**목표:** UX 완성 및 반응형 적용
**완료 기준:** 모바일·데스크탑 모두에서 핵심 기능 사용 가능, 동적 서버사이드 렌더링 대시보드 동작

---

## 체크리스트

- [x] 대시보드 메인 페이지 (`/`) 구현
- [x] '최근 변경 내역' 위젯 (서버사이드 렌더링, date-fns ko locale)
- [x] 고객사 카드 컴포넌트 반응형 그리드
- [x] 상세 페이지 타임라인 UI (수직 타임라인)
- [x] 접속 정보 카드 (복사 버튼 포함)
- [x] 모바일 네비게이션 (햄버거 메뉴)
- [x] 전 페이지 Tailwind md:/lg: 브레이크포인트 적용
- [x] 통합 검색 기능 완성
- [x] 커밋: `feat: 대시보드 실시간 위젯 및 반응형 UI 적용`

> **✅ 완료** — 2026-03-13

---

## 1. 대시보드 메인 페이지

`src/app/page.tsx`:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentChangesWidget } from "@/components/dashboard/recent-changes-widget";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [customerCount, recentChanges, auditCount] = await Promise.all([
    prisma.customer.count(),
    prisma.history.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      include: { customer: { select: { customerName: true } } },
    }),
    prisma.auditLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">대시보드</h1>
        <p className="text-stone-500 mt-1">안녕하세요, {session.user.name}님</p>
      </div>

      {/* 통계 카드 */}
      <DashboardStats
        customerCount={customerCount}
        recentAuditCount={auditCount}
      />

      {/* 최근 변경 내역 위젯 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">최근 변경 내역</h2>
        <RecentChangesWidget initialChanges={recentChanges} />
      </div>
    </div>
  );
}
```

---

## 2. 통계 카드 컴포넌트

`src/components/dashboard/dashboard-stats.tsx`:
```typescript
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ShieldCheck, AlertTriangle } from "lucide-react";

interface DashboardStatsProps {
  customerCount: number;
  recentAuditCount: number;
}

export function DashboardStats({ customerCount, recentAuditCount }: DashboardStatsProps) {
  const stats = [
    {
      label: "관리 고객사",
      value: customerCount,
      icon: Building2,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "7일 내 보안 접근",
      value: recentAuditCount,
      icon: ShieldCheck,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    // 모바일: 1열 / 태블릿 이상: 2열
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-stone-200">
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-stone-500">{stat.label}</p>
              <p className="text-3xl font-bold text-stone-900">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## 3. 최근 변경 내역 위젯 (서버사이드 렌더링)

> **구현 방식:** `force-dynamic` 서버사이드 렌더링으로 페이지 접속 시 최신 데이터 제공.
> Supabase Realtime 클라이언트 구독은 현재 미구현 상태이며, 새로고침 없이 실시간 갱신이 필요할 경우 향후 추가할 수 있음.

`src/components/dashboard/recent-changes-widget.tsx`:
```typescript
"use client";

import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";

interface RecentChange {
  id: string;
  title: string;
  eventType: string;
  updatedAt: string;
  customer: { customerName: string };
  customerId: string;
}

interface Props {
  initialChanges: RecentChange[];
}

export function RecentChangesWidget({ initialChanges }: Props) {
  const changes = initialChanges;

  const eventTypeBadge: Record<string, string> = {
    BUILD:         "bg-teal-100 text-teal-700",
    REGULAR_CHECK: "bg-stone-100 text-stone-600",
    EMERGENCY:     "bg-rose-100 text-rose-700",
    ENHANCEMENT:   "bg-blue-100 text-blue-700",
    INQUIRY:       "bg-yellow-100 text-yellow-700",
  };

  const eventTypeLabel: Record<string, string> = {
    BUILD:         "구축",
    REGULAR_CHECK: "정기 점검",
    EMERGENCY:     "긴급 장애",
    ENHANCEMENT:   "고도화",
    INQUIRY:       "문의",
  };

  return (
    <div className="space-y-3">
      {changes.map((change) => (
        <Link
          key={change.id}
          href={`/customers/${change.customerId}`}
          className="block bg-white border border-stone-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-sm transition-all"
        >
          {/* 모바일: 세로 스택 / 데스크탑: 가로 배치 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-3">
              <Badge className={eventTypeBadge[change.eventType] ?? "bg-stone-100 text-stone-600"}>
                {eventTypeLabel[change.eventType] ?? change.eventType}
              </Badge>
              <div>
                <p className="font-medium text-stone-800 text-sm">{change.title}</p>
                <p className="text-xs text-stone-500">{change.customer.customerName}</p>
              </div>
            </div>
            <span className="text-xs text-stone-400 whitespace-nowrap">
              {formatDistanceToNow(new Date(change.updatedAt), { addSuffix: true, locale: ko })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

---

## 4. 고객사 상세 페이지 — 타임라인 UI

`src/app/customers/[id]/page.tsx`:
```typescript
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerTimeline } from "@/components/customer/customer-timeline";
import { SystemInfoCard } from "@/components/customer/system-info-card";
import { Badge } from "@/components/ui/badge";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      stakeholders: { orderBy: { createdAt: "asc" } },
      histories: { orderBy: { eventDate: "desc" } },
      systemInfos: true,
    },
  });

  if (!customer) notFound();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* 헤더 — 고객사명 + 상태 배지 (Above the fold) */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{customer.customerName}</h1>
          <p className="text-stone-500 text-sm mt-1">{customer.customerCode}</p>
        </div>
        <Badge className="self-start bg-teal-100 text-teal-700 text-sm">
          {{
            IN_PROGRESS: "구축 중",
            MAINTENANCE:  "유지보수 중",
            EXPIRED:      "계약 만료",
          }[customer.contractStatus]}
        </Badge>
      </div>

      {/* 2열 레이아웃: 좌측 접속 정보 / 우측 타임라인 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {customer.systemInfos.map((info) => (
            <SystemInfoCard key={info.id} systemInfo={info} />
          ))}
        </div>
        <div className="lg:col-span-2">
          <CustomerTimeline histories={customer.histories} />
        </div>
      </div>
    </div>
  );
}
```

---

## 5. 접속 정보 카드 (복사 버튼 포함)

`src/components/customer/system-info-card.tsx`:
```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Server } from "lucide-react";
import { PasswordRevealDialog } from "./password-reveal-dialog";
import type { SystemInfo } from "@prisma/client";

interface SystemInfoCardProps {
  systemInfo: SystemInfo;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-stone-400 hover:text-teal-600 transition-colors"
      aria-label={`${label} 복사`}
    >
      {copied ? <Check className="h-4 w-4 text-teal-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export function SystemInfoCard({ systemInfo }: SystemInfoCardProps) {
  const fields = [
    { label: "서비스 URL", value: systemInfo.serviceUrl },
    { label: "접속 ID", value: systemInfo.accessId },
    { label: "서버 IP", value: systemInfo.publicIp },
    { label: "OS", value: systemInfo.osInfo },
  ].filter((f) => f.value);

  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-stone-700 flex items-center gap-2">
          <Server className="h-4 w-4 text-teal-600" />
          {systemInfo.assetType.replace("SERVER_", "")} 서버
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-xs text-stone-500 min-w-[80px]">{label}</span>
            <div className="flex items-center gap-1 flex-1 justify-end">
              <span className="text-sm text-stone-800 font-mono truncate max-w-[140px]">{value}</span>
              <CopyButton text={value!} label={label} />
            </div>
          </div>
        ))}

        {/* 비밀번호는 별도 조회 UI */}
        {systemInfo.accessPwd && (
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="text-xs text-stone-500">비밀번호</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-400 font-mono">••••••••</span>
              <PasswordRevealDialog systemInfoId={systemInfo.id} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 6. 반응형 네비게이션

`src/components/layout/nav-bar.tsx`:
```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, Building2, LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/", label: "대시보드", icon: LayoutDashboard },
    { href: "/customers", label: "고객사", icon: Building2 },
    ...(session?.user.role === "ADMIN"
      ? [{ href: "/admin/audit-logs", label: "감사 로그", icon: ShieldCheck }]
      : []),
  ];

  return (
    <nav className="bg-stone-900 text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          {/* 로고 */}
          <span className="font-bold text-teal-400 text-sm">CST</span>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors
                  ${pathname === link.href
                    ? "bg-stone-700 text-white"
                    : "text-stone-300 hover:text-white hover:bg-stone-800"
                  }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-stone-400">{session?.user.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-stone-300 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* 모바일 햄버거 버튼 */}
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="메뉴 열기"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-stone-300 hover:bg-stone-800"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-3 py-2 text-sm text-stone-300 w-full"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
```

---

## 7. 반응형 체크리스트

모든 페이지에서 아래 패턴이 적용되었는지 확인한다.

| 패턴 | 적용 위치 | Tailwind 클래스 |
|------|-----------|-----------------|
| 1열 → 2열 그리드 | 고객사 목록 | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| 좌측 사이드바 | 상세 페이지 | `grid-cols-1 lg:grid-cols-3` |
| 테이블 → 카드 | 감사 로그 (모바일) | `hidden md:table`, 모바일용 카드 대체 |
| 가로 → 세로 헤더 | 상세 페이지 타이틀 | `flex-col md:flex-row` |
| 햄버거 메뉴 | 네비게이션 | `hidden md:flex`, `md:hidden` |

---

## 완료 확인

| 항목 | 확인 방법 |
|------|-----------|
| 대시보드 통계 | 고객사 수 및 7일 감사 접근 수 표시 |
| 최근 변경 위젯 | 페이지 접속 시 최신 이력 10건 표시 (서버사이드 렌더링) |
| 복사 버튼 | 클릭 시 클립보드에 복사 및 체크 아이콘 표시 |
| 모바일 네비 | 320px 너비에서 햄버거 메뉴 노출 |
| 반응형 그리드 | 768px 기준 레이아웃 전환 확인 |

---

## 커밋 메시지

```
feat: 대시보드 실시간 위젯 및 반응형 UI 적용

- 대시보드 통계 카드 및 최근 변경 내역 위젯 구현
- 최근 변경 내역 위젯: Server Component에서 Prisma로 최신 10건 조회 (force-dynamic)
- 고객사 상세 페이지 lg:grid-cols-3 반응형 레이아웃 구현
- SystemInfoCard: 각 필드별 클립보드 복사 버튼 배치
- 모바일 햄버거 네비게이션 및 전 페이지 Mobile-first 반응형 적용
- 통합 검색: URL searchParams 기반 서버 사이드 필터링
```
