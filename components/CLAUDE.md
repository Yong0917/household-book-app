# components/

## UI 라이브러리

- shadcn/ui (`components/ui/`)
- `vaul` — Drawer/Sheet (바텀 시트)
- `recharts` — 차트
- `@dnd-kit` — 드래그앤드롭 정렬
- `cn()` from `@/lib/utils` — 클래스 병합

## 알아야 할 것들

**Zod v4:** `z.number({ message: "..." })` 사용. `invalid_type_error` 아님.

**`utcIsoToKST()` 반환값**은 반드시 `getUTC*` 메서드로 읽어야 한다 (`getHours()` 쓰면 틀림) — `lib/actions/CLAUDE.md` 참고.

**LedgerTabView 캐싱:** SSR 초기 데이터 → 인메모리 → localStorage(`ledger_cache_v1`, 최근 3개월) 순으로 데이터를 찾아 로딩 스피너 최소화. 거래 변경 시 서버가 확정한 행(`TransactionChange`)을 `lib/utils/ledgerCache.ts`의 `applyChangeToEntry`로 로컬에 즉시 반영하고, 현재 달 외 캐시를 무효화한 뒤 무음 백그라운드 재검증(`loadData(true, { silent: true })`)으로 정합성을 확보한다.

**Android 뒤로가기:** Drawer/SearchView 열 때 `history.pushState()`로 히스토리 추가, `popstate`로 단계별 닫기.

**게스트 모드:** 인증 없이 접근하면 게스트. Server Action 대신 `lib/mock/guestData.ts` 데이터 사용. 변경 시도 시 `useGuestMode().requireLogin()`으로 로그인 유도.

**영수증 스캔 접근 상태** (`AccessStatus`): `admin` | `approved` → 활성, `pending` → 비활성, `none` → 요청 버튼, `denied` → 숨김.
