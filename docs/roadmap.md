# 개발 로드맵

**프로젝트:** 고객사 통합 이력 관리 시스템 (Customer Status Tracker)
**문서 버전:** 2.0
**작성일:** 2026-03-13

---

## 아키텍처 원칙

본 프로젝트는 Next.js App Router 기반 풀스택 구조를 따른다.

```
src/
  app/                   # Server Components (데이터 페칭)
    (auth)/              # 인증 그룹 라우트
    customers/           # 고객사 목록·상세 페이지
  actions/               # Server Actions 전용 (Mutation만)
    customer.actions.ts
    audit.actions.ts
    system-info.actions.ts
  components/            # UI 컴포넌트 (Client Components 최소화)
    ui/                  # shadcn/ui 원본
    customer/            # 도메인 컴포넌트
    dashboard/           # 대시보드 컴포넌트
    layout/              # 네비게이션 등 레이아웃
  lib/
    prisma.ts            # PrismaClient 싱글턴
    auth.ts              # NextAuth 설정
    audit.ts             # Audit Log 유틸리티
  types/                 # 전역 TypeScript 인터페이스
```

**핵심 규칙:**
- 데이터 페칭은 Server Component에서 수행
- 모든 Mutation은 `src/actions/`의 Server Actions를 통해서만 처리
- `"use client"`는 상태/이벤트가 필요한 리프 컴포넌트에만 선언
- 모든 Server Action 입력은 Zod로 검증, `change_reason` / `access_reason` 필수 강제
- 민감 정보 조회 및 데이터 변경은 반드시 `AuditLog` 트랜잭션 포함

---

## 개발 Phase

### Phase 0 — 기반 설정 (D+0 ~ D+1)

빌드·배포 파이프라인을 먼저 확보하여 이후 개발에서 CI 실패 없이 진행한다.

- Next.js 14 프로젝트 생성 (TypeScript strict, App Router)
- ESLint `@typescript-eslint/no-explicit-any: error` 설정
- Prisma 초기화 + DB 연결
- GitHub 레포 연결 + Vercel 배포 연동
- `.github/workflows/ci.yml` (Lint → TypeCheck → Test → Build)
- git tag: `v0.1-skeleton`

### Phase 1 — 문서화 완성 (D+1 ~ D+2)

코드 작성 전 문서 체계를 완성한다.

- `README.md` 5개 섹션 (문제 정의·목표·기능 명세·기술 스택·실행 가이드)
- `CLAUDE.md` 구현 패턴 예시 스니펫 추가
- `docs/adr/` 아키텍처 결정 문서 3건 작성
- git tag: `v0.1-skeleton` (Phase 0과 동일 태그 범위)

### Phase 2 — 스키마 & 인증 (D+2 ~ D+3)

DB 모델과 인증 기반을 확립한다.

- Prisma 스키마: `User`, `Customer`, `Stakeholder`, `History`, `SystemInfo`, `AuditLog`
- `change_reason`, `access_reason` 필드 NOT NULL 강제
- NextAuth.js Credentials + JWT 세션 전략
- ADMIN / MEMBER 역할 기반 미들웨어
- git tag: `v0.2-schema`

### Phase 3 — 핵심 기능 구현 (D+3 ~ D+6)

6개 핵심 기능이 모두 동작하는 상태를 만든다.

1. 인증 (로그인/로그아웃)
2. 고객사 목록 조회 + 검색
3. 고객사 상세 조회 (타임라인·접속 정보)
4. 고객사 생성·수정 (Zod + `change_reason` 강제)
5. 비밀번호 마스킹 + 조회 팝업 (`access_reason`) + Audit Log 트랜잭션
6. Audit Log 열람 (관리자 전용)

- git tag: `v0.3-core`

### Phase 4 — UX 완성 & 반응형 (D+6 ~ D+7)

모바일부터 데스크탑까지 완성된 UX를 구현한다.

- 대시보드 통계 카드 + 최근 변경 내역 위젯 (서버사이드 동적 렌더링)
- 접속 정보 클립보드 복사 버튼
- 전 페이지 Tailwind Mobile-first 반응형 (`md:`, `lg:` 브레이크포인트)
- 모바일 햄버거 네비게이션
- Skeleton UI 적용 (데이터 로딩 중)

### Phase 5 — 테스트 & 마무리 (D+7 ~ D+8)

Jest 테스트를 작성하고 최종 배포를 완료한다.

- 단위 테스트: Audit Log 기록 함수, 권한 검증, Zod 스키마
- 컴포넌트 테스트: PasswordRevealDialog ARIA 검증
- CI 파이프라인 `pnpm test` 통합
- git tag: `v1.0-release`

---

## 타임라인

```
D+0 ──────────────────────────────────────────── D+8
 │
 ├─ Phase 0 (D+0~1): 기반 설정·CI/CD
 │    └─ Vercel 배포 확인, CI 그린
 ├─ Phase 1 (D+1~2): 문서화
 │    └─ README 완성, CLAUDE.md 업데이트
 ├─ Phase 2 (D+2~3): 스키마·인증
 │    └─ DB 마이그레이션 완료, 로그인 동작
 ├─ Phase 3 (D+3~6): 핵심 기능
 │    └─ 고객사 CRUD + Audit Log 동작
 ├─ Phase 4 (D+6~7): UX·반응형
 │    └─ 모바일 레이아웃 완성
 └─ Phase 5 (D+7~8): 테스트·마무리
      └─ Jest 통과, v1.0-release 태그
```

---

## 상세 구현 문서

| Phase | 문서 |
|-------|------|
| Phase 0 | [phase/phase0-setup.md](phase/phase0-setup.md) |
| Phase 1 | [phase/phase1-documentation.md](phase/phase1-documentation.md) |
| Phase 2 | [phase/phase2-schema-auth.md](phase/phase2-schema-auth.md) |
| Phase 3 | [phase/phase3-core-features.md](phase/phase3-core-features.md) |
| Phase 4 | [phase/phase4-ux-responsive.md](phase/phase4-ux-responsive.md) |
| Phase 5 | [phase/phase5-test-finalize.md](phase/phase5-test-finalize.md) |
