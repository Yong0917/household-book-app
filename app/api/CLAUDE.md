# app/api/

## 공통 규칙

- 인증: `getUser()` 사용 (Server Action의 `getClaims()`와 다름)
- 시간대: 파일명·날짜 필터는 KST 기준 (`getNowKST()`, `utcIsoToKST()`)

## 라우트별 요점

**`analyze-receipt` (POST)**
- 접근 권한: admin(`ADMIN_USER_ID`) 또는 `receipt_scan_access.status = "approved"` — 확인 시 `createAdminClient()` 사용
- Gemini 모델: `gemini-2.5-flash`, `@google/genai` SDK, 이미지는 `inlineData`(Base64)로 전달
- 응답: `{ amount?, description?, date?, type? }` — JSON을 정규식 `\{[\s\S]*\}`으로 추출

**`import/transactions` (POST)**
- Body: `{ rows: Record<string, unknown>[], mapping: { date, time, type, amount, category, asset, memo, incomeVal, expenseVal } }`
- 날짜 포맷: Excel 시리얼 → `YYYY-MM-DD` → `MM/DD/YYYY` → JS Date 순으로 파싱
- DB 삽입: 500건씩 배치

**`export/transactions` (GET)**
- 쿼리: `?startMonth=YYYY-MM&endMonth=YYYY-MM`
- 컬럼 순서: 날짜, 시간, 유형, 금액, 분류, 자산, 메모

**`backup` (GET)**
- 5개 테이블을 `Promise.all`로 병렬 조회 후 JSON 파일 반환
