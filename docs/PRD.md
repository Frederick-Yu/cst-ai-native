![][image1]  
고객사 통합 이력 관리 시스템 (Customer Status Tracker)

**버전:** 1.1

**상태:** 초안 (Draft)

**작성일:** 2026-03-13

**작성자:** Gemini & 유준영

## **![][image2]1\. 제품 개요 (Product Overview)**

* **제품 비전:** 고객사 시스템의 시작부터 현재까지 모든 히스토리를 자산화하여, 누구나 끊김 없는(Seamless) 기술 서비스를 제공할 수 있는 환경 구축
* **문제 정의:**
    * 기존 시스템 노후화 및 UI/UX 불편으로 인한 업무 효율 저하
    * 담당자 부재 시 히스토리 파악에 막대한 시간 소요 및 정보 파편화
    * 접속 정보 및 인터페이스 명세 등 핵심 정보의 관리 체계 및 보안 감사 부재
* **목표:**
    * 신규 입사자도 즉시 업무 파악이 가능한 통합 대시보드 제공
    * 구축\~유지보수 전 과정의 이력 및 변경 사유 자동 기록
    * 민감 정보에 대한 강력한 보안 관리 및 접근 이력 추적

## **2\. 타겟 사용자 및 이해관계자 (Target Audience)**

* **주요 사용자 (Primary Persona):**
    * **유지보수 팀원:** 장애 대응 및 고도화를 수행하며 최신 접속 정보를 조회해야 하는 담당자
    * **신규 입사자:** 인수인계 없이 고객사 시스템 사양과 히스토리를 학습해야 하는 팀원
* **보조 사용자 (Secondary Persona):**
    * **관리자/PM:** 프로젝트 진행 상황 모니터링 및 보안 로그를 검토하는 운영 책임자

## **3\. 사용자 스토리 (User Stories)**

| **ID** | **사용자 역할** | **요구사항 (I want to...)** | **목적 (So that...)** | **우선순위** |

| US-01 | 신규 팀원 | 특정 고객사의 시스템 구축 시점부터 현재까지의 타임라인을 확인하고 싶다. | 별도의 대면 인수인계 없이도 히스토리를 파악하기 위해 | High |

| US-02 | 유지보수 담당자 | 고객사 서버 정보뿐만 아니라 서비스 URL과 관리자 계정 정보를 확인하고 싶다. | 장애 상황에서 즉각적으로 시스템에 접속하여 조치하기 위해 | High |

| US-03 | 관리자 | 정보가 변경될 때 '누가, 언제, **왜**' 바꿨는지 명확히 알고 싶다. | 변경의 의도를 파악하고 정보의 신뢰도를 유지하기 위해 | High |

| US-04 | 실무자 | 이동 중에도 모바일로 고객사의 긴급한 정보를 확인하고 싶다. | 장소에 구애받지 않고 업무 대응을 하기 위해 | Medium |

| US-05 | 보안 담당자 | 누군가 비밀번호를 조회했다면 그 기록과 사유를 남기고 싶다. | 민감 정보 오남용을 방지하고 보안 사고에 대비하기 위해 | High |

## **4\. 핵심 기능 요구사항 (Functional Requirements)**

### **4.1 고객사별 통합 히스토리 및 담당자 관리**

* **라이프사이클 기록:** 구축 \-\> 유지보수 \-\> 고도화 단계별 이슈 및 작업 내용 기록
* **담당자 정보:**
    * 고객사측 담당자 (성함, 연락처, 직함)
    * 시스템 초기 구축 담당자 (사내)
    * 현재 유지보수 메인/서브 담당자 (사내 팀원)
* **변경 로그 상세화:** 모든 정보 수정 시 **'변경 사유'** 입력을 강제하며, 수정 전/후 데이터와 함께 기록 (Audit Trail)

### **4.2 기술 자산 및 접속 정보 관리**

* **환경 정보:** 서버 IP, DB 정보, OS 사양 등 인프라 정보
* **시스템 접속 정보:** 서비스 URL(운영/테스트), 시스템 관리자 ID/PWD 관리
* **인터페이스 관리:** 연동 시스템 목록, API 명세서, 통신 방식 및 버전 관리

### **4.3 대시보드 및 검색**

* **통합 검색:** 고객사명, 담당자, 기술 스택 키워드 검색
* **최근 변경 내역:** 대시보드 하단에 전체 고객사 중 **가장 최근에 업데이트된 정보 리스트**를 위젯 형태로 노출 (신규 변경 사항 즉시 인지)

## **5\. 비기능적 요구사항 (Non-Functional Requirements)**

* **보안 및 감사(Audit):**
    * 민감 정보(비밀번호, 개인정보 등)는 기본적으로 마스킹 처리
    * 마스킹 해제(조회) 시 **'조회 사유'** 팝업을 띄워 입력을 강제함
    * 조회자, 일시, 대상 데이터, 조회 사유를 별도 보안 로그 데이터베이스에 기록
* **성능:** 상세 페이지 호출 시 1.5초 이내 응답
* **권한:** 일반 팀원(조회/편집), 관리자(보안 로그 조회 및 사용자 관리) 구분

## **6\. 디자인 및 사용자 경험 (UI/UX)**

* **반응형 최적화:**
    * Desktop: 넓은 화면을 활용한 상세 타임라인 및 사이드바 구성
    * Mobile/Tablet: 카드 레이아웃 전환 및 터치 친화적 UI를 통해 현장에서도 가독성 확보
* **접근성:** 중요 접속 정보는 '복사 버튼'을 배치하여 오타 없이 정보를 활용할 수 있도록 배려

## **7\. 성공 지표 (Success Metrics)**

* 신규 입사자 업무 파악 기간 50% 단축
* 민감 정보 접근 이력 100% 로깅 및 가시성 확보

## **8\. 제약 사항 및 마일스톤 (Constraints & Milestones)**

* **1\~2주:** 요구사항 확정 및 상세 데이터 스키마 설계 (변경 사유, 담당자 필드 포함)
* **3\~4주:** UI/UX 모바일 반응형 프로토타이핑 및 보안 로그 로직 설계
* **5\~8주:** 개발 및 보안 테스트

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAACeklEQVR4Xu3cPWsUURQG4AQ/8BNFCcFk2cku4mJAFBb8BVqmURsLbSwEy1iIImgnRmwsDIiNhX0KK0mh/8BOCxtFFGKlKIgQ9FwzEy/XXUFIQMjzwOHeOXtyp32ZzezICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwPrYVDYAAFgboyMDwtbk5OT+TqdzvOznpqent1ZVdafdbs/HeirqTTkDAMAAvV5vd4SnB0NqudVqHWxm+/3+lghct6L/I9a3TcX1l6iv+blxfaCpmDkZ52yv+8/ieiYPbFNTU9vS/aJ/JlXs5+r7L8b1wu9TAQA2sBSSIjgdq/dPoj6XM8NEqLqSgljZb8Rn37L9H4EtSWeMjY3tynsAAGQiQF2LwPYo7SM89eP6RTkzPj6+M/qXY+5p/QRsteJvbpTzYTRmr3a73UMx8z3q3d8CW/35UlqzJ3jn8jkAgA2rDkyP6/3AwJZUK19xzpT9QWL2dNSHCG03s97QwOYJGwDAABMTEzsiPF2KUHU71ldRF+onaB/TE67Y783n68B2Pq1NdTqdo7HOtVqtfc1czJyI3uG073a7e+J6Prab01O8+rOXq4eO/Dp3Ns7p5efWwfF6PgcAwD9ovkItpZcTyl4uvVUa4e5I2QcAYI0NC2yN9FMfVVW9rga8VZrWch4AgEIErrMRnj5VK//sX/6kR173Y/ZiEbrepyAWtVz075b3KbWzt0pjvVefs5Sfk52XXmhYiHpeHAMAwHqpA9ti2QcA4D8RYW026mHZBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADW1E8nGKBRs3m4uQAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAADn0lEQVR4Xu3dPYhcVRgG4Fl2BX9R1HV1dmZnZ3dlCdjIgmgKOyGNP0Ua0d5GGwOK6SQ2dv4QixAMFoIWYhW0Ejt/YmMRlKAYg0QMaGWlQXzP7r1wvDszUUiT8XngcM757nfvbPly78zdXg8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJh7Ozs713VrV8P29vYt3doVLHYLAAA0RqPRh91aYyHHfs04k/HJ+vr6q4PB4IZu0zQ555e1tbWdbn2SXPfe9D5a18bj8XY+851c50Tm93P8QtYXMy7XfQAAcyVh51iCz9N1rYSiet8aDoePpf9gu8/685z7Wt0zSwlY/zaw5dr3dANbU3+oV919Kz0lRFYtAADzZTAYrCbwnK9r0wJb+k5mWmr36XsmtbNVS7FY7o6VwNXv92/M/Ff6DpUDkwJbjn+U469nPppxqarvC2zpe7C5xoWsv0zPp1mfm/A3AADMjwSej8uoa9MCW5Fw9E3GbyVcZbw565FouXOX8Ui1/0dgy3oj13iq3a+urg5KCCzrSYGtqf/YKS1ubm7elXmhUwcAmA8JQH9m/FDXSmAbDof3ZX55PB4/XNUPpfd4v9+/M+vbsr6YUPVcfW4tx7/vVUGqDWxNEFus1ruWl5dvzv7F5txpge1Sc53dkf13ZS5hr9sLAHDNS9g5trGxcWuWCwk958pc6vUdtiZEHW5Hzvl2be/OWVn/VAJWxntZv5txoJxTfmma9YmM+zOeba/bhKz6kehS87m78rkvJQwOy7oObIPB4PYExwdKrYz0PVH/Tc04lWOvbG1tLbfXAwC4piXcHEzwubvdNyHrdGrXz3okWpS7a81jyH2a67y9srJyU9knaI2aUFZCYTewFYvlTl7Oeas9p6gDGwDA/055fJgw9EK3Xu5kZVqYFdgSpM5mnM/5X2Q+0n1vW2rHe513qKV2IJ95x5TANtGUwLZUPnu0d/du99Ueo73XevzR6QMAmG/TAluC0RvlEWm1L7/sPFP3zHIVAlupn673pSe1n+saAMDcmxHYynfSjjZ31cpLdMuvRY90+6ZJ71fj8XilW5+kBLZR8524Tv1k9b21w+VvTe3rbh8AwFxLEDrVrbUSjj7LuJzxe8LSk73/8C+kcs4H9ffUZimBrfwadUL9+TqwNaHt8W4fAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALDP33AJvxKMeYWvAAAAAElFTkSuQmCC>