-- =============================================
-- 검색용 trigram (pg_trgm) GIN 인덱스
-- =============================================
-- searchNotes / searchTransactions / getMemoSuggestions 가
-- ilike '%kw%' 패턴이라 B-tree 미활용 → trigram GIN 으로 전환.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_txn_desc_trgm
  ON public.transactions USING GIN (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_notes_title_trgm
  ON public.notes USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_notes_content_trgm
  ON public.notes USING GIN (content gin_trgm_ops);
