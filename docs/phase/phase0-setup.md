# Phase 0 — 기반 설정 (D+0 ~ D+1)

**목표:** 빌드·배포 파이프라인 확보
**완료 기준:** Vercel에 빈 Next.js 앱이 배포되고, GitHub Actions CI가 그린 상태

---

## 체크리스트

- [x] Next.js 프로젝트 생성
- [x] TypeScript strict 모드 설정
- [x] ESLint + Prettier 설정
- [x] Prisma 초기화 + Supabase 연결 확인
- [x] GitHub 레포 생성 및 초기 Push
- [x] Vercel 프로젝트 연동
- [x] `.github/workflows/ci.yml` 작성
- [x] `.env.local` 환경 변수 정의
- [x] 커밋: `feat: 프로젝트 초기 설정 및 CI/CD 파이프라인 구성`
- [x] git tag: `v0.1-skeleton`

> **✅ 완료** — 2026-03-13

---

## 1. 프로젝트 생성

```bash
pnpm create next-app@latest cst-ai-native \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### 디렉토리 구조 초기 설정

```
src/
  app/
    (auth)/
      login/
        page.tsx
    customers/
      page.tsx
    layout.tsx
    page.tsx
  actions/          # Server Actions 전용 (Mutation만)
  components/
    ui/             # shadcn/ui 설치 후 자동 생성
  lib/
    prisma.ts
    supabase.ts
  types/
    index.ts
```

---

## 2. TypeScript strict 모드

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

## 3. ESLint 설정

`.eslintrc.json`:
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

---

## 4. Prisma 초기화

```bash
pnpm add prisma @prisma/client
pnpm prisma init
```

`prisma/schema.prisma` 초기 상태 (Phase 2에서 확장):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

`src/lib/prisma.ts` (PrismaClient 싱글턴):
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 5. shadcn/ui 설치

```bash
pnpm dlx shadcn@latest init
# Base color: Stone (프로젝트 컬러 팔레트 준수)
```

기본 컴포넌트 선치 설치:
```bash
pnpm dlx shadcn@latest add button card dialog input label skeleton badge
```

---

## 6. 환경 변수 정의

`.env.local` (로컬, Git 제외):
```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"

# NextAuth
NEXTAUTH_SECRET="[random-32-char-string]"
NEXTAUTH_URL="http://localhost:3000"
```

`.env.example` (Git 포함, 값은 빈칸):
```bash
DATABASE_URL=""
DIRECT_URL=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL=""
```

---

## 7. GitHub Actions CI 파이프라인

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ci:
    name: Build, Lint & Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm tsc --noEmit

      - name: Test
        run: pnpm test --passWithNoTests
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

`package.json` scripts 추가:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 8. Vercel 연동

1. Vercel 대시보드 → New Project → GitHub 레포 연결
2. Environment Variables에 `.env.local` 값 모두 등록
3. Framework: Next.js 자동 감지
4. `main` 브랜치 → Production 자동 배포
5. PR → Preview 배포 자동 활성화

**Branch Protection Rule (GitHub Settings):**
- `main` 브랜치 직접 Push 차단
- PR + CI 통과 필수

---

## 완료 확인

| 항목 | 확인 방법 |
|------|-----------|
| 로컬 빌드 통과 | `pnpm build` 에러 없음 |
| Lint 통과 | `pnpm lint` 에러 없음 |
| TypeScript 통과 | `pnpm tsc --noEmit` 에러 없음 |
| Vercel 배포 | URL 접속 시 Next.js 초기 화면 |
| CI 그린 | GitHub Actions 배지 초록색 |

---

## 커밋 메시지

```
feat: 프로젝트 초기 설정 및 CI/CD 파이프라인 구성

- Next.js 14 App Router + TypeScript strict 모드 설정
- ESLint @typescript-eslint/no-explicit-any error 규칙 적용
- Prisma + Supabase 연결 설정 및 PrismaClient 싱글턴 구현
- shadcn/ui Stone 테마 초기화 및 기본 컴포넌트 설치
- GitHub Actions CI (Lint→TypeCheck→Test→Build) 파이프라인 구성
- Vercel Production 배포 연동 완료
```

**git tag:** `v0.1-skeleton`
