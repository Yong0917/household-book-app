-- =============================================
-- 메모 자동완성 추천 RPC (suggest_memos)
-- =============================================
-- 단순 ILIKE 검색이던 getMemoSuggestions 를 컨텍스트(유형/카테고리/자산) 가중치 +
-- 빈도(log) + 최근성 점수로 정렬하도록 서버 측 그룹/정렬을 RPC 로 위임.
-- 인덱스: idx_txn_desc_trgm(pg_trgm) + idx_transactions_user_at 이미 존재.

CREATE OR REPLACE FUNCTION public.suggest_memos(
  p_keyword     text,
  p_type        text DEFAULT NULL,    -- 'income' | 'expense'
  p_category_id uuid DEFAULT NULL,
  p_asset_id    uuid DEFAULT NULL,
  p_limit       int  DEFAULT 8
)
RETURNS TABLE(description text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH agg AS (
    SELECT
      t.description,
      COUNT(*)                                                                            AS freq,
      MAX(t.transaction_at)                                                               AS last_used,
      COUNT(*) FILTER (WHERE p_type        IS NOT NULL AND t.type        = p_type)        AS type_match,
      COUNT(*) FILTER (WHERE p_category_id IS NOT NULL AND t.category_id = p_category_id) AS cat_match,
      COUNT(*) FILTER (WHERE p_asset_id    IS NOT NULL AND t.asset_id    = p_asset_id)    AS asset_match
    FROM public.transactions t
    WHERE t.user_id = auth.uid()
      AND t.description IS NOT NULL
      AND t.description <> ''
      AND t.transaction_at >= (now() - interval '12 months')
      AND (length(btrim(p_keyword)) = 0 OR t.description ILIKE '%' || p_keyword || '%')
    GROUP BY t.description
  )
  SELECT description
  FROM agg
  ORDER BY
    (CASE WHEN p_category_id IS NOT NULL THEN cat_match   * 2.0 ELSE 0 END) +
    (CASE WHEN p_asset_id    IS NOT NULL THEN asset_match * 1.0 ELSE 0 END) +
    (CASE WHEN p_type        IS NOT NULL THEN type_match  * 1.0 ELSE 0 END) +
    LN(freq + 1) +
    GREATEST(0, EXTRACT(EPOCH FROM (last_used - (now() - interval '12 months'))) / 86400 / 30) * 0.3
    DESC NULLS LAST,
    freq DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.suggest_memos(text, text, uuid, uuid, int) TO authenticated;
