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
- `change_reason` / `access_reason` 필수 검증을 서버 측에서 일관되게 강제 가능

## 예외

외부 시스템 연동(Webhook 수신 등) 목적의 API Route만 허용한다.

## 결과

- `src/actions/*.actions.ts` 파일만 Mutation 진입점으로 인정
- 모든 Server Action은 인증 확인 → Zod 검증 → DB 트랜잭션(AuditLog 포함) 순서를 따름
