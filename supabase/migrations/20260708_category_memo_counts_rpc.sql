-- =============================================
-- 카테고리별 고유 메모 + 건수 집계 RPC (get_category_memo_counts)
-- =============================================
-- 가계부 정리 도구(/settings/cleanup)에서 특정 카테고리의 고유 메모와
-- 각 메모의 사용 건수를 집계해 클라이언트에 넘긴다. 빈 문자열/NULL 은 제외.
-- 본인 데이터만: RLS 대신 auth.uid() 로 직접 필터 (SECURITY INVOKER).

CREATE OR REPLACE FUNCTION public.get_category_memo_counts(p_category_id uuid)
RETURNS TABLE(description text, cnt bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT t.description, COUNT(*)::bigint
  FROM public.transactions t
  WHERE t.user_id = auth.uid()
    AND t.category_id = p_category_id
    AND t.description IS NOT NULL
    AND t.description <> ''
  GROUP BY t.description
  ORDER BY COUNT(*) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_category_memo_counts(uuid) TO authenticated;
