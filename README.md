# Customer Status Tracker

[![CI](https://github.com/Frederick-Yu/cst-ai-native/actions/workflows/ci.yml/badge.svg)](https://github.com/Frederick-Yu/cst-ai-native/actions/workflows/ci.yml)

고객사 통합 이력 관리 시스템 — 구축부터 유지보수까지 모든 히스토리를 단일 대시보드에서 관리하고, 민감 정보 접근에 대한 영구적인 Audit Trail을 제공합니다.

**배포 URL:** https://cst-ai-native.vercel.app/
**현재 단계:** ✅ Phase 5 완료 — `v1.0-release`

---

## 문제 정의

| 문제 | 현황 | 영향 |
|------|------|------|
| 정보 파편화 | 구축·유지보수 이력이 위키·엑셀·메일에 분산 | 신규 입사자 온보딩에 수 주 소요 |
| 인수인계 공백 | 담당자 부재 시 히스토리 파악 불가 | 장애 대응 시간 급증 |
| 보안 감사 부재 | 비밀번호 등 민감 정보 접근 이력 미기록 | 보안 사고 시 추적 불가 |

---

## 핵심 목표

- **단일 대시보드** — 신규 입사자도 즉시 업무 파악 가능한 통합 뷰 제공
- **영구 Audit Trail** — 모든 정보 변경·민감 정보 조회에 사유(Reason) 기록 강제
- **최신 데이터 보장** — 동적 서버사이드 렌더링(force-dynamic)으로 항상 최신 데이터 제공

---

## 기존 솔루션 대비 차별화

| 구분 | 위키 / 컨플루언스 | 엑셀 | **본 시스템** |
|------|:-----------------:|:----:|:-------------:|
| 실시간 동기화 | △ | ✗ | ✅ |
| 비밀번호 조회 감사 로그 | ✗ | ✗ | ✅ |
| 변경 사유 입력 강제 | ✗ | ✗ | ✅ |
| 역할 기반 접근 제어 | △ | ✗ | ✅ |
| 모바일 반응형 | △ | ✗ | ✅ |

---

## 핵심 기능

### 1. 고객사 통합 히스토리 관리
- 구축 → 유지보수 → 고도화 단계별 타임라인 기록
- 모든 정보 수정 시 **변경 사유(`change_reason`) 입력 필수**
- 고객사측 담당자 및 사내 유지보수 담당자 연락망 통합 관리

### 2. 기술 자산 & 접속 정보 관리
- 서버 IP, DB 정보, OS 사양 등 인프라 정보 통합 관리
- 서비스 URL, 관리자 계정 정보 (비밀번호 기본 마스킹)
- 각 필드 옆 클립보드 복사 버튼으로 오타 없이 정보 활용

### 3. 보안 감사 로그 (Audit Trail)
- 비밀번호 조회 시 **조회 사유(`access_reason`) 입력 팝업** 강제 노출
- 조회자·일시·대상 데이터·IP·사유를 `AuditLog` 테이블에 영구 기록
- 관리자 전용 감사 로그 열람 화면 제공

### 4. 대시보드 & 검색
- 고객사명, 담당자, 기술 스택 키워드 통합 검색
- 최근 변경 내역 위젯 (서버사이드 동적 렌더링, 페이지 접속 시 최신 10건 표시)

---

## 기술 스택

| 구분 | 기술 | 선택 이유 |
|------|------|-----------|
| Framework | **Next.js 14 (App Router)** | Server Actions으로 API 없이 Mutation 구현, Vercel 최적화 |
| Language | **TypeScript** (strict) | Prisma 타입 안전성 확보, `any` 타입 완전 차단 |
| Database | **Supabase** (PostgreSQL) | Vercel 서버리스 환경 최적화, 관리형 PostgreSQL + RLS 내장 |
| ORM | **Prisma** | 타입 안전 쿼리, 스키마 마이그레이션 관리 |
| Auth | **NextAuth.js** | Next.js 표준 인증, 역할 기반(ADMIN/MEMBER) 세션 관리 |
| UI | **shadcn/ui** + Tailwind CSS | Stone/Teal/Rose 팔레트 구현, 반응형 최적화 |
| Validation | **Zod** | Server Action 입력 검증, 필수 사유 필드 강제 |
| Hosting | **Vercel** | GitHub Push 시 자동 빌드·배포, Preview 환경 |
| CI/CD | **GitHub Actions** | Lint → TypeCheck → Test → Build 파이프라인 |

---

## 프로젝트 구조

```
src/
  app/
    (auth)/login/         # 로그인 페이지
    customers/            # 고객사 목록·상세 (Server Components)
    admin/audit-logs/     # 감사 로그 페이지 (관리자 전용)
  actions/                # Server Actions — Mutation 전용
    customer.actions.ts
    system-info.actions.ts
    audit.actions.ts
  components/
    ui/                   # shadcn/ui 컴포넌트
    customer/             # 고객사 도메인 컴포넌트
    dashboard/            # 대시보드 위젯
    layout/               # 네비게이션
  lib/
    prisma.ts             # PrismaClient 싱글턴
    auth.ts               # NextAuth 설정
    audit.ts              # Audit Log 유틸리티
  types/                  # TypeScript 인터페이스
prisma/
  schema.prisma           # DB 스키마
docs/
  phase/                  # Phase별 상세 구현 문서
  adr/                    # 아키텍처 결정 기록
```

---

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
# .env.local 파일을 열어 아래 값을 입력
```

`.env.local` 필수 항목:

```bash
# Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"

# NextAuth
NEXTAUTH_SECRET="[random-32-char-string]"
NEXTAUTH_URL="http://localhost:3000"
```

```bash
# 4. DB 마이그레이션
pnpm prisma migrate dev

# 5. 개발 서버 실행
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속

> **프로덕션 배포:** https://cst-ai-native.vercel.app/

### 주요 스크립트

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint 검사
pnpm test         # Jest 테스트
pnpm test:watch   # Jest 감시 모드
```

---

## 데이터 모델

```
Customer ──< Stakeholder   (담당자)
         ──< History       (타임라인 이력, change_reason 필수)
         ──< SystemInfo    (접속 정보, accessPwd 마스킹)

User     ──< AuditLog      (감사 로그, access_reason 필수)
```

---

## 보안 정책

- 비밀번호(`accessPwd`)는 DB에 암호화 저장, 화면에서 기본 마스킹 처리
- 마스킹 해제(조회) 시 **조회 사유 팝업** 강제 노출 후 `AuditLog` 기록
- 모든 데이터 수정 시 `change_reason` 5자 이상 입력 필수 (Zod 검증)
- `AuditLog` 테이블은 삭제 불가 원칙 (불변 감사 기록)
- 관리자(ADMIN) / 일반 팀원(MEMBER) 역할 분리

---

## 테스트 현황

`pnpm test` 실행 시 **11개 테스트 스위트 / 81개 케이스** 전부 통과.

| 테스트 파일 | 케이스 | 검증 대상 |
|-------------|:------:|-----------|
| `audit.actions.test.ts` | 6 | `revealPassword` + AuditLog 트랜잭션 필수 기록 |
| `customer.actions.test.ts` | 7 | 고객사 생성·수정 + `change_reason` Zod 강제 |
| `auth.actions.test.ts` | 6 | 회원가입 + bcrypt 해싱 |
| `stakeholder.actions.test.ts` | 8 | 담당자 CRUD + 권한 검증 |
| `system-info.actions.test.ts` | 8 | 시스템 정보 CRUD + 비밀번호 필드 처리 |
| `history.actions.test.ts` | 5 | 이력 생성 + AuditLog 자동 기록 |
| `zod-schemas.test.ts` | 8 | `change_reason` / `access_reason` 5자 이상 검증 |
| `password-reveal-dialog.test.tsx` | 5 | ARIA 접근성 + 조회 플로우 |
| `customer-form.test.tsx` | 9 | 폼 필드 렌더링 + 에러 메시지 |
| `login-form.test.tsx` | 7 | 인증 플로우 + 실패 처리 |
| `auth.test.ts` | 7 | `authorize` 로직 (비밀번호 불일치·미존재 사용자) |

테스트 파일 위치: `src/actions/__tests__/`, `src/components/**/__tests__/`, `src/lib/__tests__/`

---

## 개발 규칙

- **커밋 메시지:** Conventional Commits 형식 준수
  ```
  feat|fix|docs|refactor|test: [작업 영역] 내용 요약
  ```
- **브랜치 전략:** `main` 직접 Push 차단, PR + CI 통과 필수
- **타입 안전:** `any` 사용 ESLint 에러 처리, Zod 스키마 필수

---

## 문서

| 문서 | 설명 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | AI 어시스턴트 컨텍스트 및 코딩 규칙 |
| [docs/roadmap.md](docs/roadmap.md) | 개발 로드맵 및 Phase 타임라인 |
| [docs/PRD.md](docs/PRD.md) | 제품 요구사항 정의서 |
| [docs/field-definition.md](docs/field-definition.md) | 데이터 필드 정의서 |
| [docs/stack-def.md](docs/stack-def.md) | 기술 스택 선택 근거 |
| [docs/adr/](docs/adr/) | 아키텍처 결정 기록 (ADR) |
