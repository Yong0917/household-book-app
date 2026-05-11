# 가계부 앱 (moneylog-app) v2 PRD — 확장 단계

> 마지막 업데이트: 2026-04-15
> 버전: v2.0 (이전: [v1.0 PRD](./PRD.md))

## 핵심 정보

**목적**: v1 MVP(거래·통계·카테고리/자산)에 일상 입력 마찰 해소·고정 지출 관리·법적 요구사항 대응을 더해 "실사용 가능한 가계부"로 확장한다
**사용자**: v1과 동일 (1인 가계부 사용자) + 영수증 입력 마찰을 느끼던 사용자, 매월 반복 지출을 관리하고 싶은 사용자

---

## v1 → v2 변경 요약 (회고)

v1 MVP를 약 2주간 직접 사용해보니 두 가지 마찰이 두드러졌다.

1. **입력 마찰**: 영수증을 보고 거래를 한 건씩 손으로 옮기는 게 가장 큰 진입장벽이었다. AI 영수증 스캔(@google/genai)으로 한 번에 입력하는 흐름이 필요했다.
2. **반복 지출의 부재**: 월세·구독료처럼 매월 같은 날짜에 발생하는 거래를 매번 등록하는 게 비효율적이었다. 고정비를 자동 등록하는 구조(`recurring_transactions`)가 필요했다.

여기에 PWA 설치·다크모드·CSV 백업 등 "한 번 만들어두면 두고두고 쓰는" 기능을 한 사이클에 묶었고, 출시를 염두에 두고 법적 문서(privacy/terms)와 회원탈퇴 유예 정책도 함께 정비했다. v1 PRD에서 "MVP 이후 기능 (제외)"으로 미뤘던 항목 중 반복거래·푸시알림·CSV·OCR 4개가 이 사이클에서 우선순위가 올라왔다.

---

## 현재 구현 상태

| 영역 | v1 | v2 | 비고 |
|------|----|----|------|
| 인증 시스템 | 완료 | 완료 | 게스트 모드·소셜 로그인 추가 |
| 가계부 핵심 (F001~F010) | 완료 | 완료 | v1 명세 유지 |
| 영수증 AI 스캔 (F011) | — | 완료 | @google/genai 기반 |
| 메모(Notes) (F012) | — | 완료 | 이미지 첨부 지원 |
| 반복 거래 (F013) | — | 완료 | 자동 생성 트리거 |
| 월별 리포트 (F014) | — | 완료 | 월별 추세 RPC |
| 푸시 알림 (F015) | — | 완료 | FCM 기반 |
| 다크모드 (F016) | — | 완료 | next-themes |
| CSV/Excel (F017) | — | 완료 | xlsx 라이브러리 |
| 회원탈퇴 유예 (F018) | — | 완료 | 30일 정책 |
| PWA 지원 (F019) | — | 완료 | manifest + 아이콘 |
| DnD 정렬 (F020) | — | 완료 | @dnd-kit/sortable |

---

## 기능 명세

### 1. v2 신규 기능

| ID | 기능명 | 설명 | 도입 이유 | 관련 페이지 |
|----|--------|------|----------|------------|
| **F011** | 영수증 AI 스캔 | 카메라/갤러리로 영수증 촬영 → @google/genai로 항목·금액 자동 추출 → 일괄 거래 등록 | 손 입력 마찰이 가장 큰 이탈 요인 | 가계부 일일/달력 보기 |
| **F012** | 메모(Notes) | 거래와 별개로 자유 메모 작성. 이미지 첨부 가능, 카테고리 추천 | 가계부에 적기 애매한 "기록"의 보조 채널 | `/notes`, `/notes/[id]` |
| **F013** | 반복 거래/고정비 | 월/주/일 단위 반복 주기 설정 → 매 주기마다 자동 거래 생성. 일일 보기 상단 배너로 미등록 고정비 알림 | 월세·구독료 반복 입력 비효율 제거 | `/settings/recurring` |
| **F014** | 월별 리포트 | 월 단위 수입/지출 요약, 카테고리 비중, 전월 대비 추세를 한 페이지에 표시 | 월말 회고용 종합 뷰 부재 | `/settings/reports`, `/statistics/report/[year]/[month]` |
| **F015** | 푸시 알림 (FCM) | 매월 말 요약·고정비 등록 알림 등을 푸시로 발송. 알림 히스토리 페이지 제공 | 가계부 진입 trigger 부재로 사용 빈도 저하 | `/settings/notifications` |
| **F016** | 다크모드 | 시스템/라이트/다크 3종 선택 | 야간 사용성 + 모바일 OS 일관성 | 전체 페이지 |
| **F017** | CSV/Excel 내보내기·가져오기 | 거래 데이터를 xlsx로 다운로드/업로드. 백업 API도 제공 | 데이터 lock-in 회피 + 백업 안전망 | 설정 페이지 |
| **F018** | 회원탈퇴 유예 | 탈퇴 신청 후 30일 유예기간 동안 복구 가능 | 잘못된 탈퇴로 인한 데이터 손실 방지·법적 요구 | `/delete-account`, `/auth/account-recovery` |
| **F019** | PWA 지원 | manifest, 앱 아이콘, Apple Web App 메타데이터로 홈 화면 설치 가능 | 모바일 앱 같은 진입 동선 확보 | 전역 |
| **F020** | 카테고리/자산 DnD 정렬 | @dnd-kit으로 드래그 정렬 후 `sort_order` DB 반영 | 사용자 선호 순서 반영 불가 문제 | `/settings/categories`, `/settings/assets` |

### 2. v1에서 변경된 기능

| ID | 변경 내용 |
|----|----------|
| **F003 일일 보기** | 상단에 미등록 고정비 알림 배너 추가 (F013 연동), 영수증 스캔 진입 버튼 추가 (F011) |
| **F005·F006 통계** | `/statistics/income`·`/statistics/expense` 분리에서 `/statistics` 단일 페이지로 통합. 카테고리 탭 안에서 수입/지출 전환. 카테고리 상세 페이지(`/statistics/category/[categoryId]`) 추가 |
| **거래 등록 시트** | 날짜·시간 피커를 네이티브 → 24시간 커스텀 드럼 피커로 교체 (iOS Safari UX 일관성) |
| **인증** | 게스트 모드, 소셜 로그인 옵션 추가. 설정 헤더에 사용자 pill 표시 |

### 3. 여전히 MVP 이후로 미루는 기능

- 예산 설정 및 진행률 표시
- 금융기관 API 연동 (자동 거래 가져오기)
- 가족/공유 가계부
- React Native 모바일 앱

---

## 메뉴 구조 변경

```
하단 탭 내비게이션 — v2에서 4탭으로 확장 검토했으나 v1 3탭 유지
├── 가계부 탭 (/ledger)
│   ├── 일일 보기 (/ledger/daily) — F011 영수증 진입, F013 배너 추가
│   └── 달력 보기 (/ledger/calendar)
├── 통계 탭 (/statistics)                    ← v1의 income/expense 분리 → 단일 페이지로 통합
│   ├── 카테고리 상세 (/statistics/category/[categoryId])   ← 신규
│   └── 월별 리포트 (/statistics/report/[year]/[month])     ← 신규
├── 설정 탭 (/settings)
│   ├── 분류 관리 (/settings/categories) — F020 DnD 추가
│   ├── 자산 관리 (/settings/assets) — F020 DnD 추가
│   ├── 고정비 관리 (/settings/recurring)        ← 신규 F013
│   ├── 알림 (/settings/notifications)            ← 신규 F015
│   └── 월별 리포트 (/settings/reports)            ← 신규 F014
└── 메모 (/notes, /notes/[id])                    ← 신규 F012 (가계부 탭 내 진입)

공개 페이지 추가 (인증 불필요)
├── 개인정보처리방침 (/privacy)                   ← 신규 (법적 요구)
├── 이용약관 (/terms)                              ← 신규 (법적 요구)
├── 계정 삭제 안내 (/delete-account)               ← 신규 F018
└── 계정 복구 (/auth/account-recovery)             ← 신규 F018

API 라우트
├── /api/analyze-receipt    ← F011
├── /api/backup             ← F017
├── /api/export/transactions ← F017
└── /api/import/transactions ← F017
```

---

## 데이터 모델 변경

v1의 4개 테이블(`profiles`, `categories`, `assets`, `transactions`)은 유지하고 다음을 신규 추가한다.

### recurring_transactions (반복 거래) — F013

| 필드 | 설명 | 타입/관계 |
|------|------|----------|
| id | 고유 식별자 | UUID |
| user_id | 소유 사용자 | → auth.users.id |
| type | 수입/지출 구분 | TEXT |
| amount | 금액 | BIGINT |
| category_id | 분류 | → categories.id |
| asset_id | 자산 | → assets.id |
| description | 내용 | TEXT |
| frequency | 반복 주기 | TEXT (daily/weekly/monthly) |
| day_of_month | 월 반복 시 일자 | INT |
| start_date / end_date | 활성 기간 | DATE |

### device_tokens, notification_logs, notification_history — F015

FCM 푸시 알림용 3개 테이블 분리:
- `device_tokens` — 사용자 단말 토큰 저장
- `notification_logs` — 발송 로그 (중복 방지·관리자 추적용)
- `notification_history` — 사용자별 알림 표시 히스토리

### user_deletion_requests — F018

30일 유예기간 정책. `scheduled_deletion_at` 컬럼으로 실제 삭제 예정일 관리.

### monthly_summary_logs — F015 연동

매월 말 요약 푸시 발송 여부 추적 (중복 발송 방지).

### receipt_scan_access — F011

영수증 OCR 기능 접근 제어 (관리자 승인 기반).

### transactions 컬럼 추가

| 필드 | 설명 |
|------|------|
| `recurring_id` | 반복 거래에서 자동 생성된 경우 원본 `recurring_transactions.id` 참조 |

### 추가 RPC·트리거

- `monthly_trend_rpc` — 월별 추세 집계 (F014 리포트용)
- `auto_sort_order` 트리거 — 카테고리/자산 신규 추가 시 자동 정렬 순서 부여 (F020 보완, v3에서 인덱스 추가)

---

## 기술 스택 변경

v1 스택은 모두 유지하고 다음을 추가한다.

| 기술 | 버전 | 용도 |
|------|------|------|
| @google/genai | ^1.47.0 | Google Gemini API — 영수증 OCR (F011) |
| @dnd-kit/core | ^6.3.1 | 드래그앤드롭 코어 (F020) |
| @dnd-kit/sortable | ^10.0.0 | 정렬 컨테이너 (F020) |
| @dnd-kit/utilities | ^3.2.2 | DnD 유틸 |
| next-themes | ^0.4.6 | 다크모드 (F016) |
| xlsx | ^0.18.5 | CSV/Excel 처리 (F017) |
| @hookform/resolvers | ^5.2.2 | RHF + Zod 통합 (v1에 누락된 어댑터) |

PWA(F019)는 외부 라이브러리 없이 Next.js manifest.ts와 정적 아이콘으로 구현.

---

## 페이지별 상세 (신규/주요 변경 페이지만)

### 영수증 스캔 모달 (F011)

| 항목 | 내용 |
|------|------|
| **역할** | 영수증 사진을 AI로 분석해 거래 일괄 등록 |
| **진입 경로** | 가계부 일일 보기 FAB 옆 카메라 버튼 → 카메라/갤러리 선택 모달 |
| **사용자 행동** | 사진 촬영 또는 갤러리 선택 → 분석 결과 미리보기 → 항목 수정 → 일괄 저장 |
| **주요 기능** | - 접근 권한 체크 (`receipt_scan_access`)<br>- @google/genai로 영수증 항목·금액 추출<br>- 분석 결과를 거래 폼 배열로 변환해 사용자 검토<br>- 일괄 저장 (배열 insert) |
| **리스크 대응** | OCR 부정확 항목은 사용자가 직접 수정 후 저장 |

### 메모 (F012) — `/notes`, `/notes/[id]`

| 항목 | 내용 |
|------|------|
| **역할** | 가계부 거래와 별개의 자유 메모. 이미지 첨부, 카테고리 자동 추천 |
| **주요 기능** | - 텍스트 + 이미지 첨부 (WebP 압축, v3에서 최적화)<br>- 250ms 디바운스로 카테고리 추천<br>- Supabase Storage에 이미지 저장 |

### 고정비 관리 (F013) — `/settings/recurring`

| 항목 | 내용 |
|------|------|
| **역할** | 월/주/일 반복 거래 등록·관리. 자동 거래 생성 |
| **주요 기능** | - 반복 주기 설정 (월 N일, 주 N요일, 매일)<br>- 활성/비활성 토글<br>- 자동 생성된 거래는 `transactions.recurring_id`로 추적<br>- 미등록 고정비를 일일 보기 상단 배너로 노출 |

### 월별 리포트 (F014) — `/statistics/report/[year]/[month]`

| 항목 | 내용 |
|------|------|
| **역할** | 월 단위 수입/지출 요약, 카테고리 비중, 전월 대비 추세 |
| **주요 기능** | - `monthly_trend_rpc`로 전월 대비 차이 계산<br>- 카테고리 비중 도넛 + 막대 차트<br>- 월말 자동 알림 발송 (F015 연동) |

### 알림 설정 (F015) — `/settings/notifications`

| 항목 | 내용 |
|------|------|
| **역할** | FCM 토큰 등록·해제, 알림 히스토리 조회 |
| **주요 기능** | - 푸시 알림 토글 (브라우저 권한 요청)<br>- `device_tokens`에 토큰 upsert<br>- `notification_history`에서 발송 이력 시간순 표시 |

### 계정 삭제 (F018) — `/delete-account`, `/auth/account-recovery`

| 항목 | 내용 |
|------|------|
| **역할** | 30일 유예 계정 삭제 정책 |
| **주요 기능** | - 탈퇴 신청 → `user_deletion_requests` 행 생성, 30일 후 삭제 예정<br>- 유예 기간 중 로그인 시 복구 가능 (`/auth/account-recovery`)<br>- 개인정보처리방침에 명시 |

---

## 인증 흐름 변경

v1의 이메일/비밀번호 흐름은 유지하고 다음 옵션을 추가:

- **소셜 로그인**: 구글 OAuth (Supabase Auth provider)
- **게스트 모드**: 비로그인 상태로 로컬 체험 가능 (제한적)
- **계정 복구**: 탈퇴 유예 중 로그인 시 자동 복구 안내

---

## 리스크 및 결정 사항

| 항목 | 결정 |
|------|------|
| @google/genai 비용·요금 제한 | `receipt_scan_access` 관리자 승인 게이트로 일반 사용자에게 무제한 노출 방지 |
| FCM 토큰 만료·갱신 | `device_tokens`에 last_active_at 컬럼, 만료 시 자동 정리 |
| 반복 거래 중복 생성 | DB 트리거 + `notification_logs`로 중복 방지 |
| CSV 가져오기 데이터 검증 | xlsx 파싱 후 Zod 스키마로 검증, 실패 행은 사용자에게 노출 |
| 통계 라우트 변경 (URL 호환성) | v1 `/statistics/income` 경로는 v2에서 `/statistics`로 통합·리디렉션. 외부 링크 영향 없음 (개인용 앱) |
| 다크모드 vs FOUC | next-themes의 attribute 모드 + suppressHydrationWarning 적용 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| v2.0 | 2026-04-15 | v1 MVP 위에 F011~F020 10개 신규 기능 추가 — 영수증 OCR, 메모, 반복거래, 월별 리포트, 푸시 알림, 다크모드, CSV, 회원탈퇴 유예, PWA, DnD 정렬. v1 "MVP 제외" 항목 4개 끌어옴. 통계 라우트 통합. 법적 문서 추가. |
