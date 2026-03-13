# **고객사 통합 이력 관리 시스템 기술 스택 제안 (v2.0 \- Next.js Fullstack)**

GitHub 연동 및 Vercel 배포를 최우선으로 고려한 **Next.js 중심의 풀스택** 구성입니다. 기존 Spring Boot 기반보다 배포가 간편하며, 프론트엔드와 백엔드를 하나의 코드베이스에서 관리할 수 있습니다.

## **1\. Core Framework (Fullstack)**

프론트엔드와 백엔드를 통합하여 관리하며 Vercel에 최적화된 스택입니다.

| 구분 | 기술 | 이유 |
| :---- | :---- | :---- |
| **Framework** | **Next.js (App Router)** | SSR/SSG 지원 및 Server Actions를 통해 백엔드 로직을 API 없이도 구현 가능합니다. |
| **Language** | **TypeScript** | 안정적인 대규모 프로젝트 관리를 위해 필수적이며, Prisma와 결합 시 강력한 타입 안정성을 제공합니다. |
| **ORM** | **Prisma** | JPA/Querydsl과 유사한 타입 안전성을 제공하며, 스키마 관리가 매우 직관적입니다. |

## **2\. Database & Storage (Vercel 최적화)**

Vercel(서버리스) 환경에서는 로컬 스토리지를 사용할 수 없으므로, 이를 대체할 클라우드 친화적인 스택을 사용합니다.

| 구분 | 기술 | 이유 |
| :---- | :---- | :---- |
| **DB** | **Supabase (PostgreSQL)** | Vercel과 연동이 쉬운 서버리스 DB이며, 실시간 기능을 기본 제공합니다. |
| **File Storage** | **Supabase Storage** | **'로컬 저장소'의 대안**입니다. Vercel 외부의 영구 저장소이며, API를 통해 로컬처럼 쉽게 제어 가능합니다. |
| **Auth** | **NextAuth.js (Auth.js)** | Next.js 표준 인증 라이브러리로, 소셜 로그인 및 세션 관리가 간편합니다. |

## **3\. Frontend & UI**

| 구분 | 기술 | 이유 |
| :---- | :---- | :---- |
| **Styling** | **Tailwind CSS** | 반응형 모바일 최적화를 가장 빠르게 구현할 수 있습니다. |
| **UI Component** | **shadcn/ui** | 디자인 수준이 높고 확장성이 뛰어나 '노후 UI 개선' 목적에 적합합니다. |
| **Form** | **React Hook Form \+ Zod** | 입력 폼의 유효성 검사 및 타입 정의를 한 번에 처리합니다. |

## **4\. Deployment & DevOps (Vercel Workflow)**

| 구분 | 기술 | 이유 |
| :---- | :---- | :---- |
| **Hosting** | **Vercel** | GitHub Push 시 자동으로 빌드 및 배포가 진행되며, Preview 기능으로 미리보기가 가능합니다. |
| **CI/CD** | **GitHub Actions** | 추가적인 복잡한 작업(배치 등)이 필요한 경우에만 보조적으로 사용합니다. |
| **Monitoring** | **Vercel Analytics / Speed Insights** | 별도 설정 없이도 기본적인 성능 및 접속 로그 모니터링이 가능합니다. |

## **5\. 아키텍처 포인트 (Vercel 환경 대응)**

1. **파일 저장 (Local Storage 이슈)**:  
   * Vercel 서버리스 함수는 실행 후 사라지기 때문에 서버 내 폴더 저장이 불가능합니다.  
   * 대신 **Supabase Storage**를 사용하여 파일은 외부 클라우드에 저장하고, DB에는 파일 경로만 기록합니다. (사용자 체감상 로컬 저장과 동일한 로직으로 구현 가능)  
2. **조회 감사 로그 (Audit)**:  
   * Next.js의 Middleware 또는 서버 함수 내의 커스텀 로직을 통해 민감 정보 접근 시 로그를 기록합니다.  
3. **데이터 변경 이력**:  
   * Prisma의 미들웨어를 활용하거나 변경 사유 입력을 강제하는 공통 래퍼 함수를 사용하여 change\_reason 기록을 자동화합니다.  
4. **보안**:  
   * 비밀번호 등 민감 데이터는 bcrypt 등으로 암호화하여 DB에 저장하며, Vercel 환경 변수(Environment Variables)를 통해 관리합니다.

