# PRD to Roadmap - 에이전트 메모리

## 프로젝트 도메인 정보 (household-book-app)

- **서비스**: 개인 가계부 MVP (거래 CRUD, 달력 보기, 카테고리별 통계, 카테고리/자산 관리)
- **핵심 도메인 용어**: 거래(transaction), 카테고리(category), 자산(asset), 수입(income), 지출(expense), 거래 유형(type: income/expense), 자산 유형(type: cash/bank/card/other)
- **인증**: 이미 완료됨 — 회원가입, 로그인, 비밀번호 재설정, 이메일 인증
- **라우트 기준점**: 로그인 성공 후 `/ledger/daily`로 리디렉션 (기존 `/protected` 변경 필요)

## 기술 결정 사항 (household-book-app)

- **Server Actions 위치**: `lib/actions/transactions.ts`, `lib/actions/categories.ts`, `lib/actions/assets.ts`
- **폼 관리**: React Hook Form 7.x + Zod (바텀 시트 내 거래 등록 폼)
- **바텀 시트**: vaul 라이브러리 (거래 등록/수정, 카테고리/자산 추가/수정 모달)
- **달력 구현**: 별도 달력 라이브러리 없이 date-fns 유틸 함수로 직접 구현 (의존성 최소화)
- **월 이동**: URL 쿼리 파라미터(`?year=2026&month=3`) 방식으로 서버 컴포넌트에서 수신
- **기본 프리셋 삽입**: DB 트리거보다 서버 액션에서 최초 데이터 조회 시 삽입 처리 권장
- **신규 설치 필요 라이브러리**: vaul, recharts, react-hook-form, zod, date-fns

## Phase 구성 패턴 (household-book-app PRD 명시 구조)

```
Phase 0: 환경 준비 (라이브러리 설치, 리디렉션 수정, 공통 레이아웃)
Phase 1: UI 프로토타입 (정적 화면 + 내비게이션 플로우 검증)
Phase 2: 더미 데이터 기반 개발 (Mock 데이터 + useState 인터랙션)
Phase 3: 백엔드 연동 (Supabase 스키마, RLS, Server Actions, 배포)
```

## 자주 누락되는 요구사항 체크리스트 (가계부 도메인)

- [ ] 카테고리/자산 삭제 시 기존 거래의 외래키 처리 방식 (RESTRICT vs SET NULL)
- [ ] 아이콘 선택 UI 방식 미명시 (lucide-react 아이콘명을 TEXT로 저장하지만 선택 UI 없음)
- [ ] 월 이동 vs 날 이동 범위 혼재 (F010이 "이전/다음 달"이지만 일일 보기는 날 이동도 필요)
- [ ] 신규 가입자 기본 프리셋 삽입 타이밍 (트리거 vs 서버 액션)
- [ ] profiles 테이블 display_name 표시 화면 미정

## 태스크 복잡도 산정 기준 (household-book-app)

- 라이브러리 설치 + 설정: 0.5d
- 정적 페이지 레이아웃 구성: 0.5~1d
- vaul 바텀 시트 컴포넌트 (폼 포함): 1.5~2d
- 달력 그리드 컴포넌트 (date-fns 기반): 1.5d
- Recharts 도넛 차트 컴포넌트: 1d
- Server Action 1개 (CRUD 단위): 0.5~1d
- RLS 정책 테이블당: 0.5~1d
- Supabase DB 테이블 생성 (스키마 설계 포함): 0.5d/테이블

## 관련 파일

- PRD: `docs/PRD.md`
- 로드맵: `docs/ROADMAP_v1.md`
- 공통 레이아웃: `app/ledger/layout.tsx`, `app/statistics/layout.tsx`, `app/settings/layout.tsx`
- 하단 탭: `components/layout/BottomTabBar.tsx`
- Mock 데이터: `lib/mock/types.ts`, `lib/mock/data.ts`
