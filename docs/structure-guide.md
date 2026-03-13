# **고객사 통합 이력 관리 시스템 구현 가이드 (Next.js & Supabase)**

Vercel 환경에 최적화된 풀스택 구현 전략입니다.

## **1\. 프로젝트 구조 (Directory Structure)**

Next.js App Router 표준 구조를 따릅니다.

/src  
  /app                 \# 페이지 및 레이아웃 (Server Components)  
    /(auth)            \# 로그인/인증 관련 페이지  
    /customers         \# 고객사 목록 및 상세  
    /api               \# 외부 연동용 API (필요시)  
  /components          \# shadcn/ui 및 공통 컴포넌트  
  /hooks               \# 클라이언트 사이드 커스텀 훅  
  /lib                 \# Prisma 클라이언트, Supabase 설정, 유틸리티  
    /prisma.ts  
    /supabase.ts  
  /services            \# 비즈니스 로직 (Server Actions)  
    /customer-service.ts  
    /audit-service.ts  
  /types               \# TypeScript 타입 정의

## **2\. 핵심 기능 구현 전략**

### **2.1 파일 저장 (Supabase Storage)**

* **로직**: 사용자가 파일을 업로드하면 supabase.storage를 통해 전용 Bucket에 저장합니다.  
* **저장 구조**: customers/{customerId}/{timestamp}\_{filename}  
* **DB 연동**: 파일의 Public URL 또는 Path를 History 테이블의 attachments 필드(JSON)에 저장합니다.

### **2.2 보안 감사 로그 (Audit Log)**

* **Server Actions 활용**: 데이터 조회/수정 로직 직전에 로그 생성 로직을 포함합니다.  
* **비밀번호 조회**: '비밀번호 보기' 버튼 클릭 시 Server Action을 호출하여 조회사유를 입력받고, 로그 저장 후 실제 비밀번호를 반환합니다.

### **2.3 데이터 변경 이력 관리**

* **Zod Schema**: 입력 단계에서 change\_reason 필드를 필수로 정의하여 유효성 검사를 수행합니다.  
* **Prisma Transactions**: 데이터 본문 업데이트와 변경 이력(History) 저장을 하나의 트랜잭션으로 묶어 데이터 무결성을 보장합니다.

## **3\. 환경 설정 (.env)**

Vercel 대시보드와 로컬 .env.local에 설정해야 할 필수 변수입니다.

\# Database  
DATABASE\_URL="postgresql://postgres:\[PASSWORD\]@db.\[PROJECT\_ID\].supabase.co:5432/postgres"  
DIRECT\_URL="postgresql://postgres:\[PASSWORD\]@db.\[PROJECT\_ID\].supabase.co:5432/postgres"

\# Supabase Auth & Storage  
NEXT\_PUBLIC\_SUPABASE\_URL="https://\[PROJECT\_ID\].supabase.co"  
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY="\[ANON\_KEY\]"  
SUPABASE\_SERVICE\_ROLE\_KEY="\[SERVICE\_ROLE\_KEY\]" \# 서버측 파일 관리용

\# Auth  
NEXTAUTH\_SECRET="\[RANDOM\_STRING\]"

## **4\. UI/UX 구현 (shadcn/ui)**

* **Dashboard**: Card 컴포넌트와 ScrollArea를 사용하여 하단에 '최근 변경 내역' 위젯 구현.  
* **Timeline**: Vertical Timeline 형태를 직접 구현하거나 Lucide 아이콘을 결합한 리스트 형태 활용.  
* **Mobile**: Tailwind의 hidden md:block 등을 활용하여 모바일에서는 핵심 정보 위주로 노출.