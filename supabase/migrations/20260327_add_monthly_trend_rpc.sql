-- 월별 수입/지출 집계 RPC 함수
-- JS 클라이언트 사이드 집계를 DB GROUP BY로 대체하여 성능 향상
CREATE OR REPLACE FUNCTION get_monthly_trend(
  p_start TIMESTAMPTZ,
  p_end   TIMESTAMPTZ
)
RETURNS TABLE(
  year    INT,
  month   INT,
  income  BIGINT,
  expense BIGINT
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    EXTRACT(YEAR  FROM transaction_at AT TIME ZONE 'Asia/Seoul')::INT AS year,
    EXTRACT(MONTH FROM transaction_at AT TIME ZONE 'Asia/Seoul')::INT AS month,
    SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END)::BIGINT   AS income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::BIGINT   AS expense
  FROM public.transactions
  WHERE transaction_at >= p_start
    AND transaction_at <  p_end
  GROUP BY 1, 2
  ORDER BY 1, 2;
$$;
