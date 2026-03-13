# Phase 2 — 스키마 & 인증 시스템 (D+2 ~ D+3)

**목표:** Prisma 스키마 확정 및 NextAuth 인증 구현
**완료 기준:** DB 마이그레이션 성공, 로그인/로그아웃 동작, 역할 기반 세션 확인

---

## 체크리스트

- [x] Prisma 스키마 전체 모델 정의 (Customer, SystemInfo, History, Stakeholder, AuditLog, User)
- [x] Supabase 데이터베이스 마이그레이션 (`prisma migrate deploy`)
- [x] NextAuth.js CredentialsProvider 설정
- [x] 역할 기반 세션 (`ADMIN` / `MEMBER`) 타입 확장
- [x] 로그인 페이지 UI (`/login`)
- [x] 인증 레이아웃 컴포넌트 (`authenticated-layout.tsx`)
- [x] Prisma seed 스크립트 (초기 관리자 계정)
- [x] 커밋: `feat: Phase 2 스키마 & 인증 시스템 구현`
- [x] git tag: `v0.2-schema`

> **✅ 완료** — 2026-03-13

---

## 1. Prisma 스키마 핵심 모델

실제 구현된 필드명 (계획 문서와 일부 다름):

| 모델 | 주요 필드 |
|------|-----------|
| `Customer` | `id`, `name`, `industryType`, `contractStatus`, `createdAt` |
| `SystemInfo` | `id`, `host`, `username`, `passwordHash`, `customerId` |
| `History` | `id`, `title`, `eventType`, `content`, `customerId`, `createdAt` |
| `Stakeholder` | `id`, `name`, `roleType`, `isActive`, `customerId` |
| `AuditLog` | `id`, `userId`, `actionType`, `targetData`, `accessReason`, `clientIp`, `createdAt` |
| `User` | `id`, `email`, `name`, `password`, `role` |

> **주의:** `customerName` → `name`, `publicIp` → `host`, `accessId` → `username`, `accessPwd` → `passwordHash`
> 새 코드 작성 시 `prisma/schema.prisma` 실제 필드명 기준으로 작성할 것.

---

## 2. NextAuth 설정 (`src/lib/auth.ts`)

- CredentialsProvider: email/password 기반 인증
- bcrypt 비밀번호 검증
- 세션에 `user.id`, `user.role` 포함 (`ADMIN` | `MEMBER`)
- `authOptions` export → 모든 `getServerSession` 호출에 사용

---

## 3. 역할 기반 접근 제어

- `ADMIN`: 감사 로그 페이지(`/admin/audit-logs`) 접근 가능
- `MEMBER`: 고객사 목록/상세 접근 가능, 감사 로그 접근 불가 → `/customers` 리다이렉트
- 인증 없는 접근 → `/login` 리다이렉트

---

## 완료 확인

| 항목 | 확인 방법 |
|------|-----------|
| 마이그레이션 | `prisma/migrations/` 디렉토리에 마이그레이션 파일 존재 |
| 로그인 | `/login`에서 이메일/비밀번호 입력 후 대시보드 이동 |
| 역할 제한 | MEMBER 계정으로 `/admin/audit-logs` 접근 시 리다이렉트 |
| 세션 | `getServerSession(authOptions)` 호출 시 `user.id`, `user.role` 반환 |

---

## 커밋 메시지

```
feat: Phase 2 스키마 & 인증 시스템 구현

- Prisma 전체 스키마 정의 (Customer/SystemInfo/History/Stakeholder/AuditLog/User)
- Supabase DB 마이그레이션 완료
- NextAuth CredentialsProvider + bcrypt 인증 구현
- ADMIN/MEMBER 역할 기반 세션 타입 확장
- 로그인 페이지 및 인증 레이아웃 컴포넌트 구현
- Prisma seed: 초기 관리자 계정 생성
```

**git tag:** `v0.2-schema` ← 미생성
