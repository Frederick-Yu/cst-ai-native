# **고객사 통합 이력 관리 시스템 상세 필드 정의서**

이 문서는 시스템의 각 엔티티별 데이터 필드와 속성을 정의합니다.

## **1\. 고객사 기본 정보 (Customer Master)**

고객사의 기본 신원과 계약 상태를 관리합니다.

| 필드명 | 설명 | 데이터 타입 | 비고 |
| :---- | :---- | :---- | :---- |
| customer\_id | 고객사 고유 코드 | String (PK) | 자동 생성 (예: CUST-2024-001) |
| customer\_name | 고객사 명칭 | String | 필수 |
| industry\_type | 업종/산업군 | Enum | 제조, 금융, 공공, 유통 등 |
| contract\_status | 계약 상태 | Enum | 구축 중, 유지보수 중, 계약 만료 |
| contract\_start\_date | 계약 시작일 | Date |  |
| contract\_end\_date | 계약 종료일 | Date |  |
| tech\_stack | 주요 기술 스택 | Array/Tags | Java, Python, Oracle, AWS 등 |

## **2\. 담당자 정보 (Stakeholders)**

내/외부 이해관계자 연락망을 관리합니다.

| 필드명 | 설명 | 데이터 타입 | 비고 |
| :---- | :---- | :---- | :---- |
| role\_type | 담당자 구분 | Enum | 고객사 담당자, 초기 구축자, 현재 유지보수(정/부) |
| name | 성함 | String | 필수 |
| organization | 소속 부서/팀 | String |  |
| position | 직함 | String |  |
| contact\_email | 이메일 주소 | String |  |
| contact\_phone | 연락처 | String |  |
| is\_active | 현재 담당 여부 | Boolean | 담당자 변경 시 히스토리 보존용 |

## **3\. 타임라인 및 이력 (Timeline & History)**

구축부터 고도화까지의 모든 이력을 기록합니다.

| 필드명 | 설명 | 데이터 타입 | 비고 |
| :---- | :---- | :---- | :---- |
| history\_id | 이력 고유 ID | Long (PK) |  |
| event\_type | 이력 구분 | Enum | 구축, 정기점검, 긴급장애, 고도화, 일반문의 |
| event\_date | 발생 일자 | Date |  |
| title | 이력 제목 | String | 핵심 요약 |
| description | 상세 내용 | Text | 마크다운 형식 지원 권장 |
| source\_repo\_url | 소스 레파지토리 URL | URL | GitHub, GitLab 등 형상관리 주소 |
| attachments | 첨부 파일 | File List | 완료 보고서, 가이드 등 |
| created\_by | 작성자 | String (FK) | 사내 담당자 |
| change\_reason | **변경 사유** | Text | **필수 입력 (US-03 반영)** |

## **4\. 기술 자산 및 접속 정보 (Technical Assets)**

실무에 즉시 투입되기 위해 필요한 핵심 정보입니다. 정보 수정 시 변경 사유 입력이 필수입니다.

### **4.1 인프라 및 서버 정보**

| 필드명 | 설명 | 데이터 타입 | 비고 |
| :---- | :---- | :---- | :---- |
| asset\_type | 자산 구분 | Enum | 서버(WEB/WAS/DB), 네트워크 장비 등 |
| hostname | 서버 호스트명 | String |  |
| public\_ip | 공인 IP | String |  |
| private\_ip | 사설 IP | String |  |
| os\_info | 운영체제 정보 | String | 예: CentOS 7.9, Windows Server 2019 |
| spec\_info | 하드웨어 사양 | String | CPU, RAM, Disk 정보 |
| change\_reason | **변경 사유** | Text | **필수 입력** |

### **4.2 시스템/서비스 접속 정보 (Sensitive)**

| 필드명 | 설명 | 데이터 타입 | 비고 |
| :---- | :---- | :---- | :---- |
| service\_url | 서비스 URL | URL | 운영/테스트 구분 필요 |
| access\_id | 접속 계정(ID) | String |  |
| access\_pwd | **접속 비밀번호** | String (Encrypted) | **마스킹 처리 필수** |
| access\_path | 접속 경로/방식 | String | VPN 필요 여부, SSH 포트 등 |
| api\_endpoint | 주요 API 주소 | String | 인터페이스 연동 시 활용 |
| change\_reason | **변경 사유** | Text | **필수 입력** |

## **5\. 보안 및 감사 로그 (Audit Logs)**

민감 정보 접근 및 데이터 변경에 대한 추적을 수행합니다.

| 필드명 | 설명 | 데이터 타입 | 비고 |
| :---- | :---- | :---- | :---- |
| log\_id | 로그 고유 ID | Long (PK) |  |
| user\_id | 수행자 ID | String (FK) | 사내 사번 또는 ID |
| action\_type | 수행 동작 | Enum | 조회(View), 생성(Create), 수정(Update), 삭제(Delete) |
| target\_data | 대상 데이터 | String | 예: ![][image1]운영서버 PW |
| timestamp | 발생 일시 | DateTime |  |
| access\_reason | **조회/변경 사유** | Text | **민감 정보 접근 시 필수 입력 (US-05 반영)** |
| client\_ip | 접속 IP | String | 접근지 추적용 |

## **6\. 대시보드 표시 항목 (Dashboard Metadata)**

대시보드 하단 '최근 변경 내역' 위젯을 위한 구성입니다.

* **표시 항목:![][image2]**  
  \-![][image3]  
  \-![][image4]  
  \-![][image5]  
  \-![][image6]  
* **정렬 기준:** updated\_at (최신순)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAewAAABBCAYAAAAT35fkAAAFMElEQVR4Xu3dW4hVVRgH8BmcohtEF5scZ86eM1bQUJQMFUn1UFL5UITd6IJvUUREBNmVCsKHiiJ8kDADJSJIuz30UhLRkxCkhL1IDyWBIKQQGRRofR9n7ziujuOZaSrHfj/42GevtfY+49N/r73X2Q4MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHOOGh4dPjc1g2d6vPH5qauqEsh0A+BsyXCcnJ0/Mz+Pj4ydVVfVq1MGozXV4z0gcd3fU/qjv4nxXlP0AwCyMjY1dHeH6favV2jUxMXFBtsX+U1GfL1y48LRyfD9GR0fPj+P3xjlvKvsAYD4ailB7OGail5YdIyMjp0ToPRa1vo/aHPVLnOvx4jSDEZ4XL168eDT6F+U2Avr6GHdb7D8T2/tizFC0XRb7P8T+VB6U56mmCewM9uhfG7UsdheU/fldVeciQGADMP/Vs9tfo1aWfSlvSUeYPxDBtzpDtt1uX16H4WEVY27IwO51njhuMto/iHoz6sE8TwZ1fN4fx70YQwYzqKN29xvYYTCOvSvGHIp6tOys/y6BDcD8l2GYoRj1e4+Z8Yxk0MZ5DvQbkBnsUT9FXZn7swjsvNi4OcYcjLHLyz6BDcBxI2fOEWrbM7Cj1pT9MxHBeFWcY2/e2i77Ss2FQnz/u81q7lkE9lD0vxP1zcjIyNllp8AG4LgQITcWgfZe1IqoAxGem8oxM5HBGOfZE9uJsq9UXyjsi1ratNUz9Jxx50Kx3bH9ebrAjguDi6rOSvCHyr4ksAE4HgxGmL0ctbIOygNRW6J9qBzYbXR09OQI20di7D3x+bzuvjqwv4ztGd3tpfoZ+J6oW7vbZzjDzmfer0X/oZylT0xMnF4O6ArsVTHmxqqzQO2VbC/HAsAxqQ7pN/J2dBNs04TjYeqfS+0sZ+R1wL49MM0LT+qV4l/F2NUDxbiZBHa9UC5n4surzgr1DXkx0T2m+XfF3/lJPWZ9fH5yNr/rBoB/XQZbBN3Gqr4d3RXYR50dp66Fahu622N/TQTi/d1t3XIWHGM+jTHP93oLWQZ19H2doZ77ea4Y/3FsT+oeF/1nRfu2JvQzgGP/rdj/qDk2Nf+ullviAMxHEYB3Rog9O1DPcDOkM6zr0D7q7eImsHMG3NWct9jXNbPjUlwknBn970f/qoEjzMDb7XaV52hm1Bm0sb+2e0wGfbS/XoZ+fTGwNWrnkiVLzsk2gQ3AvJVhlqFWdVaFl/Vj1IXlMT3k6uwtRWAPReBe0+v2dYTruRmyzRvM8mUsAz1edNKoLwgW5aKy+pgm4BfkrDr6nu41Q8/Aj/5dzSw/z1EJbADmoXzRyBMRYPeWHdG+qer8hrrnDLmU44vA7lt8z7Kob+uLhH2tznPrv1T0/Ra1rVlQVr8d7faBI8zQU4Z9c9EgsAGYlyK8lkZ4bSwXZ6U6sDNAV+R+/Zz7uvo29WFvNKsrX0P6Qi5Ai2NvaXXeXNZUzoJzkddLEbat8rtqC3rNkrvl35RVtvdLYAMw79S3wj+L8Lqj7EvR/lzVedtZE275TPraqjMTzlnwh3UIz6TWVf3dYu9JYAPwv5ErqiP0vqi6nlU3z3hTq/OzqHyByZ/9UTvK31j/F+YosHe0+rzNDwDMwhwF9vZ2u31J2QcAzJEI2zVVj/+Fq191YG+NwB4u+wCAOZKrvceLl6YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAP+YP7OBl7WYAZlAAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAsCAYAAADYUuRgAAADAUlEQVR4Xu3cvYtcVRgH4FnWiIrBQhfM7MfsbrO4iiKDacQyEBCbEFBIYZFCsbFT/A/s/SiCIBaLKCkUsQhYBC1MKRItJCkisVlBsEiRpNDfu95Lbo6TIZtGcJ8Hzp573vPO3fbHmbl3NAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALhL29vb97e1Wba2tg63tXnG4/FDbQ0AgP1ZqD+TyeTS+vr68Xazlb6vMj5I7wPt3izpezX9F9s6AMCBkTB05g7jYsZPfd94PH4s6yM11tbWTlboyryZeSeh6pOu/tLw3rGY2pvLy8uPDovpPb+0tPRwXdcJWv2/3OOzwf/ezbjW9+cev976NAAAe7oQdr6tlwpb2fs0l/dV35zAthfOMr5ua31gK3XaVvfo13Wf9PyWcXp1dfWpzFf7PQAAOglJZzN22npJ/USC1At1fReB7Xr2X2tqtwW20gS2t9NzebB2wgYAkAD2XILRsZWVlQdr3Z2MnWr7ptPpodS/6dfzAlvWT6b+Z8aLw3rW32c8m3Gmr80IbN9l7Ob6i8x/9HsAAAdWF8SuJSBNa50A9WOFuKZtIT1vbGxsTPrCvMCW+uepPZ/xy7Ce3t9T+zjzh4Peb1M7WSP1nczn+j0nbAAAnQSlKxW8uuv3Rt0ToJ2FBKcvE6weH9T2TsNSO979ru2Jvp5Qd3S4zvXN9L3eXf/rK9F2Xda7J0mrv9kCADiYEox+6APbndRXpun5K+NqnXz1I+vdBKxXqifzO22wi8X+adFZgW0o+5cS+J6u65pz/7faHgCA/706/epOwfZe1dGNn1N7ZvDV5KnJP6/ceHn42VkvyU3/tEZbn2VeYKvXh9Sp3bA2GbxeBACAe7SfwFa/eWtrvc3NzUcS0N4f3fo6tn43d2HYAwDAPdhPYEsA+6itDWX/Ru71bj3cUHPWJ9oeAAD2b3F0+0MKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMB/629ciJ2eTosA/AAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAsCAYAAADYUuRgAAACs0lEQVR4Xu3bP2hTURQH4IhFFAUFLaVN0jTBxehWFFydFR06CI4i3RxVxMXBxUFwEsTFwUFc3FwcxEWwHRycxEFFFBTqbJd6bn2vvF5eTIoFwXwfHHL/nHez/rjJazQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIBxtjNf+IOt9AIAsB06nc6PqA/5ep3om476GcOJfO9vzM7OXo5znze2+VwAgP9CEcI+lvNWq7Un5mtRKxGkPsXnatRSuT83N/ewHJdi/33Ut9Rf1NOY30/hLupk3h/7VycnJ/cNWwMAGCsRnJ5F2Lobn9dTuIo6VaxvCmy5FNBi/1bUnaiLMX+Z9wwS/S/qQlgKZxEMDxffPd1sNg/GudfqegEAxsVEBKM35SQC05Wod2mcB7aZmZlDEZ7Oxf7pqIXYW4q6Ue7X3bANsCOee5AvJnW3aWltampqb3UNAGBsRBiajzpTzlNYSrdfaZwHtqT4WXO+nBf9a1ErUavV3kGKc4/k60mEvsXO759MN1Ue4gAAxkaEr14EogvlvNlstmL+OY1HCWyF9TdER71ha7fbx6N3d6o8iKW16hwAgMbW/sMW8ycptEX/4263e6IasNLzldadKdhVA1k6q3qbV4q1fpzzOva/pLOLW7XlqO/FeKOi73z+PADA2KoLbEmEqqN5kCrqa7/f35X3l9JZdYGtFGHsQPrONE7/W+sUP80CADDAoMCWRLi62W63jxU9Zb3K+6pGCGxno+dtt9udKgLbo7wHAICKIoRtvEE6zLAbsWGBLSmC2votGwAAQ6TglP5blq8PMkJgW655YWGT+L7F6LkUtVCpe/Hs7bwXAIAt6vV6+/M1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOCf+gXSG5daH62KZQAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAsCAYAAADYUuRgAAAB1UlEQVR4Xu3cwWoTURQG4EhVBKXiIgZJJrmTZBUQF8GNDyAUcaWC4DOIu/YBuqqL0pfwJXwJceHOTcXXKPRcncBwmUShSeni++AwJ+fe2f/c4abXAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+E+LxeJuOQMA4AaZTCY/o16V8zX2ygEAADsyHo8/RlA7j3oS/ev2Wp5FHdd1PVjN+v3+g9h31N4HAMB27EX4+pxSeh+B6130v6PqHNLWBbaucNaEuIP2DACALWuC2lm0tzYFtryeT9iakPan6rp+Fs8XxT4AALYpn66NRqOnEdDeppRONgS2Xqzfa945L0/bAADYgeVyeSfC18VwOBzF8/RfgW1FYAMAuAYRut5EfW/6H/nTZtcn0fl8vh/9p6qqXub5umpfRgAA4IoiYB0MBoP7q9/T6fRhzI67AlvrnW8x+9Wuyd/LCl9i+XZ7LwAAV7TuNGxTYMsBbzabPe61/net6+YoAAA7lE/eUkpfuwJbF4ENAOCaNbdFD6MeVVX1vFwv5cAW4e5DOQcA4AbJN03LGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwdZex2lGfBIkH2gAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAsCAYAAADYUuRgAAACe0lEQVR4Xu3cPYxMURgG4NnskviLQtbEzNz5W2yMcoKGqLQKChWlSo1KhChVotloVBKdYjuFWq8SiSg0gkazEuE7cW9yc9wxs7aT50m+zLnn59ZvzrlnWi0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAd6HQ6e/O+GZbzDgAAFjSdTnf1+/2z0VzKx+YZDAabUfeiuZKP1a2trR2OeVtRj/MxAADmW4rAdjPqQj6QRMh6EPU+xj+kivbHqGeTyWR3Gh8Oh0/zNU1i7a1Y9yrvBwBgjghRX6LuR72JOpKP10XoOhlzPrVqu3F5YIvn8+k95a7a5mg0aqd+gQ0AYPvSztq1VKkdtRyB6l0KVb1eb08+OYmxl2U9qnbc8sBWF/O2qrbABgCwDRGerkfQOtOa8d3aaDQ6nfeVx6Zph+1GrB1W/bMCW/RfKYriXPVcBbYIg0c7nU5RnwsAwJ/+ekmgwXIEsNdleymC1/cIYxfTQ1NgS4Ev5nyNcHas6isD24/yO7h0UQEAgCbj8fh4BKaf1ZFmGaC+Rb2N2qjVw5i+kgJZzJnk76mkIFZ/jvcfjDV30+3TeMflaN8ub6I6EgUA+FcpTK2uru7P+3NlCNuI+dP19fUD8ftiULuoEO0TRVGcqq+JOVej7ghsAAA7sGhgS8egEbo+V8/dbvdQbYdtpf/7/9waCWwAADuQwlS73d6X9+fywJb+siM/Ep0lzWv63g0AgAUsGrrSLlyErucR2i6lo9B0EaHb7fbyeU3KHbYneT8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADA/+oX+cNyCwR2y/EAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAsCAYAAADYUuRgAAAC10lEQVR4Xu3cPWxNYRgH8Nu0JCJikqI9Pe1VStk6WGzEJCYsEqNEYkIqDBazRSISicFgMWDXQWJiIJ0kYhADCalJJIiP523P0dPXvVeN3N8veXLOed7n3HPHf9770WoBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACszmDe6GHVs1NTUxtafzEPAPDfGxsb21cUxda8/ydlWW6J+hynQ/larp6Nupav5WLmYtSneE/b8jUAgL4UgW02AtLXvJ9MT0+vjbVXMfM6VZy/ifqR+ml9fHz8Vn5PEjPnInAdbPbi/vPRf1hdDsb1ybi+0aj5qLvV7Eyq5bsBAPpUhKIDEZIux/HoKne/3qf5+rpbYIvXa8fc26zXDGy5gfTaMbM7XQhsAACtxVB0IkLSQpwOVNfHUqCKOpONLmq32xtjbW5ycnJTY8ftSz6XRP94ufRx6S+9AlsEv72xPttafi8CGwDQ14YiON1uVeEoNzMzs2Z4eHh91k47YC+jTkc9qpvddthi5vtqd9jS82LtRbOXwlrM3ovjkaj9zTUAAH43GMHswsjIyGhrKbidLYricFroFNjSXNotizoUs7vqfqfAVoW16xMTE2Wzb4cNAOhb7XZ7R4SsJ+mjzPSRZqo4/xj1LYWvsvoBQPTvx/HK6Ojo9jifzl+nlkJY3ov7HtTnKbiV1Q8a8sAWz9scvUvxjHV1r5bCWjPsAQD0tTxI9VIFumfpv9IicO2Mex/Xa9V1+h7aCmkXLQ4DXZ4zFPediv5cs5kCW/V/bAAAdAlSHcXcQlEUexrXT5vrvfR6Tt6vQh4AAEkVpFbscHXTIbA9b673kp7T6TtvSR7YAABo6BWkcjF3p1z6teiW6ntm8/lMN1UwvJr3k+i/K1f+ie7NqA/5HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMC/7ifxoZjfYo7EggAAAABJRU5ErkJggg==>