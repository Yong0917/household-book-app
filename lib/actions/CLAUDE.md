# lib/actions/

Server Action 파일. 모든 파일 첫 줄에 `"use server"` 필수.

## 인증

```typescript
const { data: authData } = await supabase.auth.getClaims();
if (!authData) throw new Error("인증이 필요합니다");
const userId = authData.claims.sub as string;
```

## 알아야 할 것들

**`revalidatePath` 사용 경로:** `/settings/categories`, `/settings/assets`, `/settings/recurring`, `/notes`
→ `transactions.ts`는 revalidatePath 없음. 클라이언트(`LedgerTabView`)가 직접 재fetch한다.

**`cache()` 적용 함수:** `getCategories`, `getAssets` — 동일 요청 내 중복 호출 제거용.

**RPC 호출:**
- `delete_current_user` — 회원 탈퇴 (모든 데이터 정리)
- `get_monthly_report_data(p_user_id, p_year, p_month)` — 월별 결산
- `get_monthly_trend(p_start, p_end)` — 월별 추이

**Storage:** `note-images` 버킷 하나. 메모 삭제 시 `.delete().select("images")` 로 1번 왕복으로 처리.

**고정비 날짜 처리** (`getUnprocessedRecurring`):
- 미래 달 → 빈 배열
- 현재 달 → `dayOfMonth <= 오늘`만
- `dayOfMonth: 31`이면 해당 달 마지막 날로 자동 clamp

## 시간대 규칙

DB 저장 UTC, 표시 KST. `lib/utils/timezone.ts` 함수 사용.

`utcIsoToKST()` 반환값은 UTC 기준 Date다. 반드시 `getUTCHours()`, `getUTCFullYear()` 등 **UTC 계열 메서드**로 읽어야 한다. `getHours()` 쓰면 틀린다.
