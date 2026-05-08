-- =============================================
-- categories / assets 일괄 재정렬 RPC
-- =============================================
-- 기존엔 N개 UPDATE 를 Promise.all 로 던져 N RTT 발생.
-- 단일 RPC + UPDATE ... FROM unnest(...) WITH ORDINALITY 로 1 RTT.

CREATE OR REPLACE FUNCTION public.reorder_categories(p_ids uuid[])
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.categories AS c
     SET sort_order = idx.ord - 1
    FROM unnest(p_ids) WITH ORDINALITY AS idx(id, ord)
   WHERE c.id = idx.id
     AND c.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.reorder_categories(uuid[]) TO authenticated;


CREATE OR REPLACE FUNCTION public.reorder_assets(p_ids uuid[])
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.assets AS a
     SET sort_order = idx.ord - 1
    FROM unnest(p_ids) WITH ORDINALITY AS idx(id, ord)
   WHERE a.id = idx.id
     AND a.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.reorder_assets(uuid[]) TO authenticated;
