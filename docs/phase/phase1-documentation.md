# Phase 1 — 문서화 완성 (D+1 ~ D+2)

**목표:** 프로젝트 문서화 완성
**완료 기준:** README 5개 섹션 완성, CLAUDE.md 예시 스니펫 보강, ADR 문서 작성

---

## 체크리스트

- [x] `README.md` 5개 섹션 작성 (문제 정의·목표·기능 명세·기술 스택·실행 가이드)
- [x] `CLAUDE.md` 구현 예시 스니펫 추가 (Server Action, Zod, Audit Log 패턴)
- [x] `docs/adr/001-server-actions-only.md` 작성
- [x] `docs/adr/002-audit-log-transaction.md` 작성
- [x] `docs/adr/003-tech-stack-rationale.md` 작성
- [x] 커밋: `docs: README 프로젝트 정의 및 기술 스택 섹션 완성`
- [x] 커밋: `docs: CLAUDE.md 구현 패턴 예시 추가 및 ADR 문서 작성`

> **✅ 완료** — 2026-03-13

---

## 1. README.md 완성 구조

아래 5개 섹션을 모두 포함한다.

### 섹션 1: 프로젝트 소개 & 문제 정의

```markdown
## 문제 정의

기존 고객사 관리의 3대 문제점:

| 문제 | 현황 | 영향 |
|------|------|------|
| 정보 파편화 | 구축/유지보수 이력이 위키·엑셀·메일에 분산 | 신규 입사자 온보딩 수 주 소요 |
| 인수인계 공백 | 담당자 부재 시 히스토리 파악 불가 | 장애 대응 시간 급증 |
| 보안 감사 부재 | 비밀번호 등 민감 정보 접근 이력 미기록 | 보안 사고 시 추적 불가 |
```

### 섹션 2: 핵심 목표 & 차별화

```markdown
## 핵심 목표

1. **단일 대시보드** — 신규 입사자도 즉시 업무 파악 가능
2. **영구 Audit Trail** — 모든 데이터 변경·민감 정보 조회에 사유 기록 강제
3. **실시간 동기화** — Supabase Realtime으로 변경 사항 즉시 반영

## 기존 솔루션 대비 차별화

| 구분 | 위키/컨플루언스 | 엑셀 | **본 시스템** |
|------|----------------|------|--------------|
| 실시간 동기화 | △ | ✗ | ✅ |
| 비밀번호 조회 감사 | ✗ | ✗ | ✅ |
| 변경 사유 강제 | ✗ | ✗ | ✅ |
| 역할 기반 접근 제어 | △ | ✗ | ✅ |
```

### 섹션 3: 핵심 기능 명세

```markdown
## 핵심 기능

### 1. 고객사 통합 히스토리 관리
- 구축 → 유지보수 → 고도화 단계별 타임라인 기록
- 모든 정보 수정 시 **변경 사유(change_reason) 입력 필수**

### 2. 기술 자산 & 접속 정보 관리
- 서버 IP, DB 정보, OS 사양 등 인프라 정보 통합 관리
- 서비스 URL, 관리자 계정 정보 (비밀번호 마스킹 처리)

### 3. 보안 감사 로그 (Audit Trail)
- 비밀번호 조회 시 **조회 사유(access_reason) 입력 팝업** 강제 노출
- 조회자·일시·대상 데이터·사유를 AuditLog 테이블에 영구 기록
- 관리자 전용 Audit Log 열람 화면 제공
```

### 섹션 4: 기술 스택 표

```markdown
## 기술 스택

| 구분 | 기술 | 선택 이유 |
|------|------|-----------|
| Framework | Next.js 14 (App Router) | Server Actions으로 API 없이 Mutation 구현, Vercel 최적화 |
| Language | TypeScript (strict) | Prisma 타입 안전성 + any 타입 완전 차단 |
| Database | Supabase (PostgreSQL) | Vercel 서버리스 환경 최적화, Realtime 기본 제공 |
| ORM | Prisma | 타입 안전 쿼리, 스키마 마이그레이션 관리 |
| Auth | NextAuth.js | Next.js 표준 인증, 역할 기반 세션 관리 |
| UI | shadcn/ui + Tailwind CSS | Stone/Teal/Rose 팔레트 구현, 반응형 최적화 |
| Validation | Zod | Server Action 입력 검증, change_reason 필수 강제 |
| Hosting | Vercel | GitHub Push 자동 배포, Preview 환경 |
| CI/CD | GitHub Actions | Lint → Test → Build 파이프라인 |
```

### 섹션 5: 로컬 실행 가이드

```markdown
## 로컬 실행 가이드

### 사전 요구사항
- Node.js 20+
- pnpm 9+
- Supabase 계정 및 프로젝트

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/[org]/cst-ai-native.git
cd cst-ai-native

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 Supabase 및 NextAuth 값 입력

# 4. DB 마이그레이션
pnpm prisma migrate dev

# 5. 개발 서버 실행
pnpm dev
```

브라우저에서 http://localhost:3000 접속
```

---

## 2. CLAUDE.md 보강 내용

기존 CLAUDE.md에 아래 구현 패턴 예시를 추가한다.

### Server Action 패턴 예시 추가

```markdown
### Server Action 표준 구현 패턴

모든 Mutation은 `src/actions/` 하위에만 작성한다. 아래 패턴을 반드시 준수한다:

\`\`\`typescript
// src/actions/customer.actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const UpdateCustomerSchema = z.object({
  customerId: z.string().min(1),
  customerName: z.string().min(1, "고객사명은 필수입니다"),
  change_reason: z.string().min(5, "변경 사유는 5자 이상 입력해야 합니다"),
});

export async function updateCustomer(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "인증이 필요합니다" };

  const parsed = UpdateCustomerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.$transaction([
      prisma.customer.update({ where: { id: parsed.data.customerId }, data: { name: parsed.data.customerName } }),
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          actionType: "UPDATE",
          targetData: `Customer:${parsed.data.customerId}`,
          accessReason: parsed.data.change_reason,
        },
      }),
    ]);
    return { success: true };
  } catch (error) {
    return { success: false, error: "저장 중 오류가 발생했습니다" };
  }
}
\`\`\`
```

---

## 3. ADR 문서 작성

### docs/adr/001-server-actions-only.md

```markdown
# ADR 001: 데이터 Mutation은 Server Actions만 사용

**상태:** 확정
**날짜:** 2026-03-13

## 결정

모든 데이터 생성·수정·삭제 작업은 `src/actions/` 디렉토리의 Server Actions를 통해서만 수행한다.
`/app/api` 경로의 API Route 생성을 원칙적으로 금지한다.

## 이유

- Next.js 14 App Router의 Server Actions는 타입 안전한 RPC 패턴을 제공
- API Route 없이도 폼 제출, 데이터 변경이 가능하여 코드 중복 제거
- Zod 검증과 Prisma 트랜잭션을 서버에서 단일 흐름으로 처리 가능

## 예외

외부 시스템 연동(Webhook 수신 등) 목적의 API Route만 허용한다.
```

### docs/adr/002-audit-log-transaction.md

```markdown
# ADR 002: Audit Log 기록은 트랜잭션으로 원자성 보장

**상태:** 확정
**날짜:** 2026-03-13

## 결정

민감 정보 조회 및 데이터 수정 시 AuditLog 기록을 비즈니스 로직과 동일한 `prisma.$transaction()` 안에서 처리한다.

## 이유

- 본문 업데이트 성공 후 로그 기록 실패 시 감사 공백 발생 방지
- 트랜잭션 롤백 시 로그도 함께 롤백되어 일관성 보장
- `change_reason` / `access_reason` 누락을 Zod 레이어에서 차단하여 감사 로그 완전성 확보

## 구현 패턴

\`\`\`typescript
await prisma.$transaction([
  prisma.systemInfo.update({ ... }),
  prisma.auditLog.create({ data: { accessReason, userId, actionType: "UPDATE" } }),
]);
\`\`\`
```

### docs/adr/003-tech-stack-rationale.md

```markdown
# ADR 003: 기술 스택 선택 근거

**상태:** 확정
**날짜:** 2026-03-13

## 결정 사항

| 기술 | 선택 이유 |
|------|-----------|
| Supabase | Vercel 서버리스 환경에서 로컬 DB 사용 불가 → 클라우드 PostgreSQL 필수. Realtime 기능 내장 |
| Prisma | TypeScript 타입 자동 생성으로 `any` 없는 DB 접근 보장 |
| NextAuth.js | Next.js App Router 공식 권장 인증 라이브러리, 세션 기반 역할 관리 |
| shadcn/ui | 컴포넌트 소스를 직접 소유하여 Stone/Teal/Rose 팔레트 커스터마이징 용이 |
| Zod | 런타임 + 컴파일타임 이중 검증, Server Action 입력 강제화에 최적 |
```

---

## 완료 확인

| 항목 | 확인 방법 |
|------|-----------|
| README 5개 섹션 | 문제정의·목표·기능명세·스택표·실행가이드 모두 포함 여부 |
| CLAUDE.md 스니펫 | Server Action 패턴 예시 코드 포함 여부 |
| ADR 3개 | `docs/adr/` 디렉토리에 001~003 파일 존재 여부 |

---

## 커밋 메시지

```
docs: README 프로젝트 정의 및 기술 스택 섹션 완성

- 문제 정의/핵심 목표/기능 명세/기술 스택 표/로컬 실행 가이드 작성
- 기존 솔루션 대비 차별화 비교 표 포함
- CLAUDE.md Server Action 표준 구현 패턴 예시 추가
- ADR 001~003 작성 (Server Actions Only, Audit Transaction, Stack 근거)
```
