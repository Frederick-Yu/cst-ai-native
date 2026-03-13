# ADR 003: 기술 스택 선택 근거

**상태:** 확정
**날짜:** 2026-03-13

## 결정 사항

| 기술 | 선택 이유 |
|------|-----------|
| **Next.js 14 (App Router)** | Server Actions + RSC로 API Route 없이 풀스택 구현, Vercel 네이티브 최적화 |
| **Supabase** | Vercel 서버리스 환경에서 로컬 DB 사용 불가 → 클라우드 PostgreSQL 필수. Realtime 기능 내장 |
| **Prisma** | TypeScript 타입 자동 생성으로 `any` 없는 DB 접근 보장, 마이그레이션 관리 용이 |
| **NextAuth.js** | Next.js App Router 공식 권장 인증 라이브러리, 세션 기반 역할(ADMIN/MEMBER) 관리 |
| **shadcn/ui** | 컴포넌트 소스를 직접 소유하여 Stone/Teal/Rose 팔레트 커스터마이징 용이 |
| **Zod** | 런타임 + 컴파일타임 이중 검증, Server Action 입력 강제화 및 `change_reason` 필드 누락 차단에 최적 |
| **Tailwind CSS** | 유틸리티 클래스 기반 반응형 구현(`md:`, `lg:` 프리픽스), shadcn/ui와 자연스럽게 통합 |

## 대안 검토

| 기술 | 검토 대안 | 선택하지 않은 이유 |
|------|-----------|-------------------|
| Database | PlanetScale, Neon | Supabase의 Realtime 기능이 실시간 대시보드 요구사항에 직접 부합 |
| Auth | Clerk, custom JWT | NextAuth.js가 Next.js App Router와 가장 자연스럽게 통합되며 무료 |
| UI Library | MUI, Chakra UI | shadcn/ui는 소스 소유 방식으로 디자인 시스템 완전 제어 가능 |

## 결과

이 스택은 타입 안전성(TypeScript + Prisma + Zod), 서버 중심 아키텍처(RSC + Server Actions), 클라우드 네이티브 배포(Vercel + Supabase) 세 축을 중심으로 구성되며, 각 기술이 서로의 강점을 보완한다.
