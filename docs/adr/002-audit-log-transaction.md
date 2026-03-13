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

```typescript
await prisma.$transaction([
  prisma.systemInfo.update({ ... }),
  prisma.auditLog.create({ data: { accessReason, userId, actionType: "UPDATE" } }),
]);
```

## 결과

- AuditLog 없는 Mutation 코드는 코드 리뷰에서 반려
- `AuditLog` 테이블은 삭제 불가 원칙(불변 감사 기록)으로 운영
