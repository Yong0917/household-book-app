# 가계부 앱 (moneylog-app) 개발 로드맵 v2 — 확장 단계

> 마지막 업데이트: 2026-04-15
> 버전: v2.0 (이전: [v1.x ROADMAP](./ROADMAP.md))
> 기준 PRD: [PRD_v2.md](./PRD_v2.md)

---

## 프로젝트 개요

v1 ROADMAP의 Phase 0~3로 MVP(거래 CRUD·통계·카테고리/자산)를 완성한 직후, 약 한 달간 직접 사용해보며 발견한 두 가지 큰 마찰을 해소하기 위한 확장 사이클. 동시에 외부 출시를 염두에 두고 PWA·법적 문서·회원탈퇴 정책도 함께 정비했다. 마이그레이션 8개와 신규 라이브러리 5종(`@google/genai`, `@dnd-kit/*`, `next-themes`, `xlsx`, `@hookform/resolvers`)이 이 사이클에서 추가됐다.

---

## 성공 지표 (KPI)

- 영수증 1장으로 5건 이상 거래를 30초 이내에 일괄 등록 가능 (F011)
- 고정비 5건 등록 시 매월 자동 생성 누락 0건 (F013)
- 푸시 알림 수신율 80% 이상 (FCM, F015)
- PWA 설치 가능 (Android Chrome / iOS Safari) (F019)
- v1 기능(F001~F010) 회귀 0건

---

## 기술 스택 (v1 대비 추가)

| 분류 | 기술 | 비고 |
|------|------|------|
| AI | @google/genai ^1.47.0 | 영수증 OCR |
| DnD | @dnd-kit/core ^6.3.1, sortable ^10.0.0, utilities ^3.2.2 | 카테고리·자산 정렬 |
| 테마 | next-themes ^0.4.6 | 다크모드 |
| 파일 | xlsx ^0.18.5 | CSV/Excel |
| 폼 | @hookform/resolvers ^5.2.2 | RHF+Zod 어댑터 보완 |
| PWA | (Next.js manifest.ts 내장) | 외부 라이브러리 없이 구현 |

---

## 개발 로드맵

### Phase 4-1: 반복 거래·고정비 관리 (3일) ✅ 완료 — 2026-03-16

**목표**: 월세·구독료 같은 반복 지출을 매번 입력하지 않도록 자동 생성 구조 구축
**완료 기준**: `recurring_transactions` 테이블에서 활성 항목을 매 주기마다 `transactions`로 자동 insert, 일일 보기에 미등록 고정비 배너 노출

- [x] `supabase/migrations/20260316_add_recurring_transactions.sql` 작성 — `recurring_transactions` 테이블 (id, user_id, type, amount, category_id, asset_id, frequency, day_of_month, start_date, end_date), `transactions.recurring_id` 컬럼 추가, RLS | 담당: 백엔드 | 예상: 1d | 우선순위: 🔴높음
- [x] `lib/actions/recurring.ts` Server Actions — 반복 거래 CRUD, 활성/비활성 토글 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `app/(protected)/settings/recurring/page.tsx` + 폼 컴포넌트 — 주기 선택(월/주/일), 시작·종료일 | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🔴높음
- [x] `RecurringBanner` 컴포넌트 — 일일 보기 상단에 미등록 고정비 알림 (이후 v3에서 카테고리 Map 조회 최적화 적용) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간

---

### Phase 4-2: 회원탈퇴 유예 정책·법적 문서 (3일) ✅ 완료 — 2026-03-24

**목표**: 출시 전 필수 법적 요구사항(개인정보처리방침·이용약관) 정비 및 30일 탈퇴 유예 정책 구현
**완료 기준**: `/privacy`, `/terms` 페이지 접근 가능, 탈퇴 후 30일 내 로그인 시 자동 복구

- [x] `supabase/migrations/20260324_add_deletion_requests.sql` — `user_deletion_requests` 테이블 (user_id, requested_at, scheduled_deletion_at) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `/privacy`, `/terms` 페이지 작성 — 버전 히스토리 드롭다운 포함 (commit `c3a117c`) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🔴높음
- [x] `app/delete-account/page.tsx` 탈퇴 안내 + 신청 폼 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `app/auth/account-recovery/page.tsx` 유예 기간 중 로그인 시 자동 복구 흐름 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] privacy-update 스킬 추가 — 기능 변경 시 개인정보처리방침·이용약관 자동 동기화 (commit `5a8e9ea`) | 담당: 도구 | 예상: 0.5d | 우선순위: 🟢낮음

---

### Phase 4-3: 푸시 알림 (FCM)·월별 리포트 (4일) ✅ 완료 — 2026-03-27~03-30

**목표**: 가계부 진입 trigger를 외부에서 제공 (월말 요약, 고정비 등록 알림). 동시에 월별 리포트 뷰 신설
**완료 기준**: FCM 토큰 등록, `device_tokens` upsert, 매월 말 자동 발송, 중복 발송 방지

- [x] `supabase/migrations/20260327_add_monthly_trend_rpc.sql` — `monthly_trend_rpc(year, month)` RPC | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `supabase/migrations/20260329_add_monthly_summary_logs.sql` — `monthly_summary_logs` (중복 발송 방지용) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `supabase/migrations/20260329_add_push_notification_tables.sql` — `device_tokens`, `notification_logs` 테이블 | 담당: 백엔드 | 예상: 1d | 우선순위: 🔴높음
- [x] `supabase/migrations/20260330_add_notification_history.sql` — `notification_history` (사용자별 알림 표시 이력) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `PushNotificationToggle` 컴포넌트 — 브라우저 알림 권한 요청 + 토큰 등록 | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🔴높음
- [x] `app/(protected)/settings/notifications/page.tsx` — 알림 히스토리 페이지 (commit `3d8bd8b`, `eb9e6c6`) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [x] `app/(protected)/settings/reports/page.tsx` + `/statistics/report/[year]/[month]` — 월별 리포트 (전월 대비 추세) | 담당: 풀스택 | 예상: 1d | 우선순위: 🟡중간
- [x] send-recurring-notifications Edge Function — 인증 헤더 체크 정비 (commit `a1228df`) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🟡중간

---

### Phase 4-4: 영수증 AI 스캔 (5일) ✅ 완료 — 2026-04-01~04-15

**목표**: 영수증 1장으로 다건 거래 일괄 등록. 사용자 입력 마찰 최대로 줄임
**완료 기준**: 카메라/갤러리에서 영수증 캡처 → @google/genai 분석 → 사용자 검토·수정 후 일괄 저장 동작

- [x] `supabase/migrations/20260401_add_receipt_scan_access.sql` — `receipt_scan_access` 테이블 (관리자 승인 게이트) | 담당: 백엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `@google/genai` 라이브러리 설치 및 API 키 환경변수 설정 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `app/api/analyze-receipt/route.ts` — 이미지 업로드 → Gemini 분석 → 거래 배열 응답 (commit `bba9b50`) | 담당: 백엔드 | 예상: 1d | 우선순위: 🔴높음
- [x] 영수증 스캔 모달 UI — 분석 결과 미리보기 + 항목별 수정 + 일괄 저장 | 담당: 프론트엔드 | 예상: 1.5d | 우선순위: 🔴높음
- [x] 카메라/갤러리 선택 메뉴 추가 (commit `70a091c`) → 중앙 모달로 교체 (commit `3c5253c`) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [x] 영수증 스캔 모달 vaul Drawer 포인터 이벤트 충돌 해결 (commit `2f2320e`, `6af88d5`) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🔴높음
- [x] `receiptAccessStatus`를 CalendarView까지 전달 (commit `3be4f6f`) — 권한 없는 사용자 UI 일관성 | 담당: 풀스택 | 예상: 0.5d | 우선순위: 🟡중간

---

### Phase 4-5: 부가 기능 — 메모·다크모드·CSV·PWA·DnD 정렬 (병행, 약 7일) ✅ 완료 — 2026-03~04 분산 진행

**목표**: 단독으로는 작지만 "한 번 만들어두면 두고두고 쓰는" 기능들을 묶어 한 사이클에 처리
**완료 기준**: 각 기능이 독립적으로 동작하고 회귀 없이 통합

#### 메모(Notes) — F012

- [x] `app/(protected)/notes/`, `app/(protected)/notes/[id]/` 라우트 — 텍스트 + 이미지 첨부 | 담당: 풀스택 | 예상: 1.5d | 우선순위: 🟡중간
- [x] `lib/actions/notes.ts` Server Actions — 메모 CRUD, Supabase Storage 이미지 업로드 | 담당: 풀스택 | 예상: 1d | 우선순위: 🟡중간
- [x] 카테고리 자동 추천 (250ms 디바운스, commit `03d4aff`) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟢낮음

#### 다크모드 — F016

- [x] `next-themes` 설치 및 `ThemeSelector` 컴포넌트 — 시스템/라이트/다크 3종 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [x] 전 페이지 다크모드 토큰 적용 검증 | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🟡중간

#### CSV/Excel — F017

- [x] `xlsx` 설치 + `/api/export/transactions`, `/api/import/transactions`, `/api/backup` 라우트 | 담당: 백엔드 | 예상: 1d | 우선순위: 🟡중간
- [x] `ExportButton`, `ImportButton` 컴포넌트 (iOS safe area 하단 패딩 적용, commit `a1c59a7`) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [x] 백업·엑셀 다운로드 응답에 Cache-Control 헤더 추가 (commit `0025d96`) | 담당: 백엔드 | 예상: 0.25d | 우선순위: 🟡중간

#### PWA — F019

- [x] `app/manifest.ts` 작성, 앱 아이콘 세트 추가, Apple Web App 메타데이터 (commit `e43e2c4`) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🟡중간

#### DnD 정렬 — F020

- [x] `@dnd-kit/*` 설치 + `SortableList` 래퍼 컴포넌트 | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟢낮음
- [x] 카테고리/자산 리스트에 DnD 적용, 드롭 시 `sort_order` Server Action으로 반영 | 담당: 풀스택 | 예상: 1d | 우선순위: 🟢낮음

---

### Phase 4-6: UI/UX 디테일 정비 (3일) ✅ 완료 — 2026-04 후반

**목표**: 통계 라우트 통합, 날짜·시간 피커 교체, 인증 UI 정비. v2 출시 전 폴리싱
**완료 기준**: 통계 진입 시 단일 페이지, 거래 등록 시 24시간 드럼 피커, 게스트 표시 일관

- [x] 통계 라우트 통합 — `/statistics/income`·`/statistics/expense` → `/statistics` 단일 페이지, 카테고리 상세 페이지 신설 (`/statistics/category/[categoryId]`) | 담당: 풀스택 | 예상: 1d | 우선순위: 🟡중간
- [x] 네이티브 시간 피커 → 24시간 커스텀 드럼 피커 교체 (commit `54404e5`, `8401db2`) | 담당: 프론트엔드 | 예상: 1d | 우선순위: 🟡중간
- [x] 날짜 피커에 연도/월 선택 뷰 추가 (commit `aea4876`) | 담당: 프론트엔드 | 예상: 0.5d | 우선순위: 🟡중간
- [x] 설정 헤더에 사용자 pill (이메일/게스트) 표시 (commit `f904bac`) | 담당: 프론트엔드 | 예상: 0.25d | 우선순위: 🟢낮음
- [x] 로그인 폼에서 회원가입 링크 제거 (commit `5e4330b`) — 진입 흐름 단순화 | 담당: 프론트엔드 | 예상: 0.25d | 우선순위: 🟢낮음

---

## 리스크 및 학습한 점

| 항목 | 사전 예상 | 실제 결과·대응 |
|------|----------|---------------|
| @google/genai 비용 | API 호출 비용 폭증 우려 | `receipt_scan_access` 관리자 승인 게이트로 제한. 일반 사용자에게 무제한 노출 방지 |
| vaul Drawer + 모달 중첩 | 영수증 모달과 거래 시트 동시 열림 시 충돌 가능 | 실제로 포인터 이벤트 충돌 발생 (commit `2f2320e`, `6af88d5`로 수정) |
| FCM 토큰 만료 | 발생 빈도 불명확 | `notification_logs`로 발송 결과 추적, 실패 시 토큰 invalidate |
| 통계 라우트 변경 (URL 호환성) | 외부 링크 깨질 우려 | 개인용 앱이라 영향 없음. 다만 future-proof를 위해 redirect 고려 (미적용) |
| 사이클 범위 부풀음 | 4~5개 기능 예상 | 실제 10개 기능 + 폴리싱이 같이 들어가며 약 1개월 소요. **다음 사이클부터는 더 작은 단위로 분할 필요** |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| v2.0 | 2026-04-15 | Phase 4-1~4-6 완료 — 반복거래·법적문서·푸시알림·영수증OCR·메모·다크모드·CSV·PWA·DnD·UI폴리싱. 마이그레이션 8개, 라이브러리 5종 추가. v1의 MVP 제외 기능 4개 끌어옴. |
