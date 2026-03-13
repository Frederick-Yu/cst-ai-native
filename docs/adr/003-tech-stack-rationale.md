# ADR 003: 기술 스택 선택 근거

**상태:** 확정
**날짜:** 2026-03-13

## 결정 사항

| 기술 | 버전 | 선택 이유 |
|------|------|-----------|
| **Next.js** | 16.x (App Router) | Server Actions + RSC로 API Route 없이 풀스택 구현, Vercel 네이티브 최적화 |
| **Supabase** | — | Vercel 서버리스 환경에서 로컬 DB 사용 불가 → 클라우드 PostgreSQL 필수. 관리형 인프라 및 Row Level Security 내장 |
| **Prisma** | 6.x | TypeScript 타입 자동 생성으로 `any` 없는 DB 접근 보장, 마이그레이션 관리 용이 |
| **NextAuth.js** | 4.x | Next.js App Router 공식 권장 인증 라이브러리, 세션 기반 역할(ADMIN/VIEWER) 관리 |
| **shadcn/ui** | 4.x | 컴포넌트 소스를 직접 소유하여 Stone/Teal/Rose 팔레트 커스터마이징 용이 |
| **Zod** | 4.x | 런타임 + 컴파일타임 이중 검증, Server Action 입력 강제화 및 `change_reason` 필드 누락 차단에 최적 |
| **Tailwind CSS** | 4.x | 유틸리티 클래스 기반 반응형 구현(`md:`, `lg:` 프리픽스), shadcn/ui와 자연스럽게 통합 |

## 의존성 상세 — shadcn/ui v4 + Tailwind CSS v4 마이그레이션

> **배경:** shadcn/ui v4와 Tailwind CSS v4 출시로 인해 내부 프리미티브 라이브러리와 애니메이션 플러그인이 교체되었음.
> 이 변경은 shadcn/ui 공식 마이그레이션 가이드를 따른 것으로, 호환성 문제가 아니라 생태계의 공식 업그레이드 경로임.

### `@base-ui/react` (Radix UI 대체)

- **구버전:** shadcn/ui v3는 `@radix-ui/react-dialog`, `@radix-ui/react-button` 등을 프리미티브로 사용
- **현버전:** shadcn/ui v4부터 MUI 팀의 **Base UI**(`@base-ui/react`)로 프리미티브 교체
- **이유:** Base UI는 Radix UI 대비 접근성(WAI-ARIA) 구현이 강화되고 React 19와의 호환성이 개선됨
- **적용 범위:** `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`에서 직접 사용

### `tw-animate-css` (`tailwindcss-animate` 대체)

- **구버전:** Tailwind CSS v3 환경에서 `tailwindcss-animate` 플러그인을 `tailwind.config.js`에 등록
- **현버전:** Tailwind CSS v4는 플러그인 등록 방식 대신 CSS `@import` 방식을 사용하며, `tw-animate-css`가 그 공식 대체재
- **적용 방식:** `src/app/globals.css`에서 `@import "tw-animate-css"`로 로드
- **제공 기능:** `data-open:animate-in`, `data-closed:animate-out`, `fade-in-*`, `zoom-in-*` 등 Dialog 진입/퇴장 애니메이션 클래스

### `shadcn` (CLI 패키지)

- **역할:** 컴포넌트 스캐폴딩 CLI (`npx shadcn add dialog` 등), 프로덕션 번들에는 포함되지 않음
- **버전:** 4.0.x — shadcn/ui v4 컴포넌트 생성을 지원하는 버전

## 대안 검토

| 기술 | 검토 대안 | 선택하지 않은 이유 |
|------|-----------|-------------------|
| Database | PlanetScale, Neon | Supabase는 관리형 PostgreSQL + RLS + 풍부한 대시보드를 무료 플랜에서 제공하며 Prisma와 완벽 호환 |
| Auth | Clerk, custom JWT | NextAuth.js가 Next.js App Router와 가장 자연스럽게 통합되며 무료 |
| UI Library | MUI, Chakra UI | shadcn/ui는 소스 소유 방식으로 디자인 시스템 완전 제어 가능 |
| UI Primitive | Radix UI (`@radix-ui/react-*`) | shadcn/ui v4 공식 마이그레이션 대상 → Base UI로 교체됨 |
| Animation | `tailwindcss-animate` | Tailwind CSS v4의 CSS-first 방식과 맞지 않음 → `tw-animate-css`로 교체 |

## 결과

이 스택은 타입 안전성(TypeScript + Prisma + Zod), 서버 중심 아키텍처(RSC + Server Actions), 클라우드 네이티브 배포(Vercel + Supabase) 세 축을 중심으로 구성되며, 각 기술이 서로의 강점을 보완한다.

`@base-ui/react`와 `tw-animate-css`는 shadcn/ui v4 + Tailwind CSS v4로의 공식 업그레이드 경로에 따른 의존성으로, 기존 Radix UI 및 `tailwindcss-animate`와 완전히 호환되는 대체재이다.
