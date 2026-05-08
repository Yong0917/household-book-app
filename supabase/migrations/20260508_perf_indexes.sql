-- =============================================
-- 성능 인덱스 추가
-- =============================================
-- RLS 정책이 매 쿼리마다 user_id 로 필터하지만 user_id 컬럼에 인덱스가 없어
-- 데이터가 누적될수록 풀 스캔이 발생하던 문제 해결.

-- transactions: 월별 조회, 카테고리/자산 필터, RLS 모두 user_id 가 prefix
CREATE INDEX IF NOT EXISTS idx_transactions_user_at
  ON public.transactions (user_id, transaction_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category
  ON public.transactions (user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_asset
  ON public.transactions (user_id, asset_id);

-- categories / assets: 정렬 조회용
CREATE INDEX IF NOT EXISTS idx_categories_user_type_sort
  ON public.categories (user_id, type, sort_order);
CREATE INDEX IF NOT EXISTS idx_assets_user_sort
  ON public.assets (user_id, sort_order);

-- notes: 고정/최근 정렬
CREATE INDEX IF NOT EXISTS idx_notes_user_pinned_updated
  ON public.notes (user_id, is_pinned DESC, updated_at DESC);

-- recurring_transactions / user_deletion_requests: RLS 단일 user_id 필터
CREATE INDEX IF NOT EXISTS idx_recurring_user
  ON public.recurring_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_deletion_user
  ON public.user_deletion_requests (user_id);
