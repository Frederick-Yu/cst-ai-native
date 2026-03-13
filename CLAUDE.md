# **Customer Support Tracker \- AI System Context & Instructions (CLAUDE.md)**

이 문서는 '고객사 통합 이력 관리 시스템' 프로젝트의 AI 코딩 어시스턴트(Claude)를 위한 컨텍스트 및 시스템 지침서입니다. AI는 코드 생성, 리팩토링, 테스트 작성 시 반드시 아래의 규칙과 평가 기준을 엄격하게 준수해야 합니다.

## **1\. 프로젝트 도메인 및 핵심 가치 (Idea & Value)**

* **해결하려는 문제 (Problem):** 기존 고객사 시스템의 구축/유지보수 이력이 파편화되어 있고, 암호 등 민감 정보에 대한 보안 감사(Audit) 체계가 부재하여 인수인계 및 장애 대응에 막대한 시간이 소요됨.
* **핵심 목표 (Goal):** 신규 입사자도 즉시 업무 파악이 가능한 단일 대시보드 제공 및 민감 정보 접근/변경 시 사유(Reason) 입력을 강제하는 영구적인 Audit Trail 구축.
* **차별화 (Differentiation):** 단순한 위키나 엑셀을 넘어, Vercel \+ Supabase 기반으로 실시간 동기화되며, 모든 데이터 변경(특히 비밀번호 조회)에 대해 '조회 사유'를 남기는 강력한 내부 통제(Compliance) 기능을 내재화함.
* **AI 지침:** 코드를 작성할 때 단순히 기능을 구현하는 것을 넘어, "이 코드가 정보의 파편화를 막고 보안 추적성을 높이는가?"를 항상 고려하라.

  ## **2\. 아키텍처 및 기술 스택 (Tech Implementation & Architecture)**

본 프로젝트는 **Next.js (App Router) 기반의 풀스택(Fullstack)** 환경이다.

* **Core:** Next.js 14+ (App Router), React 18+, TypeScript
* **Database & Auth:** Supabase (PostgreSQL), NextAuth.js (Auth.js)
* **ORM:** Prisma (엄격한 타입 시그니처 유지)
* **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide Icons
* **아키텍처 관심사 분리 (AI 강제 규칙):**
    1. **Server Components (RSC) 기본화:** 데이터 페칭은 가급적 Server Component에서 수행한다.
    2. **Server Actions:** 데이터베이스 Mutation(생성, 수정, 삭제)은 오직 `src/actions/` 디렉토리 하위의 Server Actions를 통해서만 수행한다. 직접 API Route(`/app/api`)를 만드는 것은 지양한다.
    3. **Client Components:** 인터랙션(상태 관리, 이벤트 리스너)이 필요한 경우에만 파일 최상단에 `"use client"`를 선언하고 최소한의 범위로 유지한다.

       ## **3\. 코드 품질 및 구현 규칙 (Code Quality)**

* **Type Safety:** 모든 변수, 함수 매개변수, API 응답은 TypeScript 인터페이스나 타입으로 명확히 정의한다. `any` 타입 사용은 엄격히 금지한다.
* **Validation:** 폼 입력 및 Server Actions로 넘어오는 모든 데이터는 **Zod**를 사용하여 유효성 검사(Validation)를 수행한다. 특히 `change_reason`, `access_reason` 필드의 누락을 철저히 검증한다.
* **Error Handling:** 모든 비동기 로직(DB 접근 등)은 `try-catch` 블록으로 감싸고, 사용자에게 친화적인 에러 메시지를 반환한다.
* **Audit Log 강제:** 비밀번호 조회나 정보 수정 로직을 작성할 때는 **반드시** `AuditLog` 테이블에 기록을 남기는 트랜잭션을 포함해야 한다.

  ## **4\. UI/UX 및 완성도 (Completeness & UX)**

* **반응형 디자인 (Responsive):** 모든 화면은 Tailwind CSS의 `md:`, `lg:` 프리픽스를 사용하여 모바일(Mobile-first)부터 데스크탑까지 완벽하게 호환되도록 작성한다.
* **직관성:** 핵심 정보(접속 정보, 담당자)는 최소한의 클릭으로 도달 가능하게 하고, 데이터 로딩 중에는 반드시 Skeleton UI(`shadcn/ui` 활용)를 노출하여 사용자 경험을 향상시킨다.
* **스타일 일관성:** 색상 팔레트는 `stone` 계열(배경/텍스트)과 `teal` 계열(강조/포인트), `rose` 계열(보안/경고)로 제한하여 전문적이고 깔끔한 UI를 유지한다.

  ## **5\. 검증 계획 및 테스트 전략 (Verification & CI/CD)**

AI는 코드 변경 사항을 제안할 때, 다음 검증 전략을 고려하여 **테스트 코드를 함께 제안**해야 한다.

* **테스트 프레임워크:** Jest & React Testing Library (단위 및 컴포넌트 테스트)
* **작성 규칙:** 1\. 비즈니스 핵심 로직(예: 권한 검증, Audit Log 기록 함수)에 대해서는 반드시 단위 테스트(Unit Test) 코드를 작성한다. 2\. UI 컴포넌트 테스트 시에는 주요 접근성(Accessibility) 롤과 ARIA 속성이 올바른지 검증한다.
* **CI/CD (GitHub Actions):** `.github/workflows` 에 정의된 파이프라인(Build \-\> Test \-\> Vercel Deploy)이 깨지지 않도록 로컬에서 빌드 에러 및 린트(Lint) 에러가 없는 코드를 생성한다.

  ## **6\. 개발 진행 기록 (Progress Tracking)**

* AI가 코드를 작성하거나 수정안을 제시한 후 Commit Message를 작성할 때는 다음 Conventional Commits 형식을 따른다.
* 형식: `feat|fix|docs|refactor|test: [작업 영역] 작업 내용 요약 (#이슈번호)`
* 예시: `feat: 고객사 상세 비밀번호 조회 시 Audit Log 기록 기능 추가`
* 모든 주요 결정 사항(Architecture Decision)은 README.md 또는 관련 문서에 즉시 업데이트한다.

**\[AI Assistant 활성화 확인\]** 이 파일을 읽었다면, 앞으로의 모든 코드 제안과 구조 설계는 위 기준(특히 분리된 아키텍처, Zod 검증, 반응형 UX, 테스트 작성)을 엄격하게 적용하여 대답하라.

## **7\. 구현 패턴 예시 (Implementation Patterns)**

### Server Action 표준 구현 패턴

모든 Mutation은 `src/actions/` 하위에만 작성한다. 아래 패턴을 반드시 준수한다:

```typescript
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
```

### Zod 스키마 패턴

- `change_reason`: 데이터 수정 시 필수, `.min(5)` 강제
- `access_reason`: 민감 정보 조회 시 필수, `.min(5)` 강제
- 모든 Server Action 입력은 `safeParse` 후 `success` 여부를 반환값으로 처리

### Audit Log 트랜잭션 패턴

비즈니스 로직과 AuditLog 기록은 **반드시 같은 트랜잭션**으로 처리한다:

```typescript
await prisma.$transaction([
  prisma.systemInfo.update({ where: { id }, data: { ...fields } }),
  prisma.auditLog.create({
    data: { userId, actionType: "UPDATE", targetData, accessReason },
  }),
]);
```

