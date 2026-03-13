# Phase 2 — 스키마 & 인증 (D+2 ~ D+3)

**목표:** 아키텍처 기반 확립
**완료 기준:** Prisma 마이그레이션 성공, 로그인/로그아웃 동작, 역할 기반 미들웨어 적용

---

## 체크리스트

- [ ] Prisma 스키마 전체 모델 작성 (5개 모델)
- [ ] `pnpm prisma migrate dev` 실행 및 성공 확인
- [ ] NextAuth.js 설치 및 설정
- [ ] 로그인 페이지 UI 구현
- [ ] 역할 기반 미들웨어 작성
- [ ] `src/lib/auth.ts` authOptions 정의
- [ ] 커밋: `feat: Prisma 스키마 및 NextAuth 인증 설정`
- [ ] git tag: `v0.2-schema`

---

## 1. Prisma 스키마

`prisma/schema.prisma` 전체:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// 사내 사용자 (NextAuth 연동)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  auditLogs AuditLog[]
  histories History[]

  @@map("users")
}

enum Role {
  ADMIN   // 관리자: 보안 로그 조회, 사용자 관리
  MEMBER  // 일반 팀원: 조회/편집
}

// 고객사 기본 정보
model Customer {
  id              String         @id @default(cuid())
  customerCode    String         @unique // 예: CUST-2024-001
  customerName    String
  industryType    IndustryType?
  contractStatus  ContractStatus @default(IN_PROGRESS)
  contractStart   DateTime?
  contractEnd     DateTime?
  techStack       String[]       // ["Java", "Oracle", "AWS"]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  stakeholders Stakeholder[]
  histories    History[]
  systemInfos  SystemInfo[]

  @@map("customers")
}

enum IndustryType {
  MANUFACTURING  // 제조
  FINANCE        // 금융
  PUBLIC         // 공공
  DISTRIBUTION   // 유통
  OTHER
}

enum ContractStatus {
  IN_PROGRESS    // 구축 중
  MAINTENANCE    // 유지보수 중
  EXPIRED        // 계약 만료
}

// 담당자 정보 (고객사측 + 사내)
model Stakeholder {
  id           String       @id @default(cuid())
  customerId   String
  roleType     StakeholderRole
  name         String
  organization String?
  position     String?
  email        String?
  phone        String?
  isActive     Boolean      @default(true)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@map("stakeholders")
}

enum StakeholderRole {
  CLIENT_MANAGER    // 고객사 담당자
  INITIAL_BUILDER   // 초기 구축 담당자
  MAIN_MAINTAINER   // 유지보수 메인 담당자
  SUB_MAINTAINER    // 유지보수 서브 담당자
}

// 타임라인 이력
model History {
  id            String      @id @default(cuid())
  customerId    String
  createdById   String
  eventType     EventType
  eventDate     DateTime
  title         String
  description   String?     // 마크다운 지원
  sourceRepoUrl String?
  attachments   Json?       // Supabase Storage URL 배열
  change_reason String      // 필수: 변경 사유
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  customer  Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  createdBy User     @relation(fields: [createdById], references: [id])

  @@map("histories")
}

enum EventType {
  BUILD           // 구축
  REGULAR_CHECK   // 정기 점검
  EMERGENCY       // 긴급 장애
  ENHANCEMENT     // 고도화
  INQUIRY         // 일반 문의
}

// 기술 자산 및 접속 정보 (민감 데이터 포함)
model SystemInfo {
  id             String    @id @default(cuid())
  customerId     String
  assetType      AssetType
  hostname       String?
  publicIp       String?
  privateIp      String?
  osInfo         String?
  specInfo       String?
  serviceUrl     String?
  serviceEnv     ServiceEnv? // 운영/테스트 구분
  accessId       String?
  accessPwd      String?     // 암호화 저장 필수
  accessPath     String?
  apiEndpoint    String?
  change_reason  String      // 필수: 변경 사유
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@map("system_infos")
}

enum AssetType {
  SERVER_WEB
  SERVER_WAS
  SERVER_DB
  NETWORK
}

enum ServiceEnv {
  PRODUCTION
  STAGING
  DEVELOPMENT
}

// 보안 감사 로그 (불변, 삭제 불가 원칙)
model AuditLog {
  id           String     @id @default(cuid())
  userId       String
  actionType   ActionType
  targetData   String     // 예: "SystemInfo:xxx의 접속 비밀번호"
  accessReason String     // 조회/변경 사유 (필수)
  clientIp     String?
  createdAt    DateTime   @default(now())

  user User @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}

enum ActionType {
  VIEW    // 민감 정보 조회
  CREATE  // 생성
  UPDATE  // 수정
  DELETE  // 삭제
}
```

---

## 2. NextAuth.js 설정

```bash
pnpm add next-auth @auth/prisma-adapter
```

`src/lib/auth.ts`:
```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
```

`src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## 3. TypeScript 타입 확장

`src/types/next-auth.d.ts`:
```typescript
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
```

---

## 4. 역할 기반 미들웨어

`src/middleware.ts`:
```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    // 관리자 전용 경로에 일반 사용자 접근 차단
    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/customers", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/customers/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
  ],
};
```

---

## 5. 로그인 페이지

`src/app/(auth)/login/page.tsx`:
```typescript
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-900">Customer Success Tracker</h1>
          <p className="text-stone-500 mt-2">고객사 통합 이력 관리 시스템</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

`src/components/auth/login-form.tsx`:
```typescript
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    router.push("/customers");
  }

  return (
    <Card className="border-stone-200">
      <CardHeader>
        <CardTitle className="text-stone-800">로그인</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" required placeholder="name@company.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && (
            <p className="text-sm text-rose-600" role="alert">{error}</p>
          )}
          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## 완료 확인

| 항목 | 확인 방법 |
|------|-----------|
| DB 마이그레이션 | `pnpm prisma migrate dev` 성공 |
| 스키마 확인 | Supabase 대시보드에 5개 테이블 생성 |
| 로그인 동작 | `/login` 접속 → 인증 성공 시 `/customers` 리다이렉트 |
| 미인증 차단 | 미로그인 상태에서 `/customers` 접속 시 `/login` 리다이렉트 |
| 관리자 차단 | MEMBER 계정으로 `/admin` 접속 시 `/customers` 리다이렉트 |

---

## 커밋 메시지

```
feat: Prisma 스키마 및 NextAuth 인증 설정

- 5개 모델 정의: User, Customer, Stakeholder, History, SystemInfo, AuditLog
- change_reason, access_reason 필드 NOT NULL로 감사 로그 완전성 보장
- NextAuth.js Credentials Provider + JWT 세션 전략 설정
- ADMIN/MEMBER 역할 기반 미들웨어 구현
- 로그인 페이지 Stone/Teal 팔레트 적용
```

**git tag:** `v0.2-schema`
