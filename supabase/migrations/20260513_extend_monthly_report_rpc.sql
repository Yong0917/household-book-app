-- 월별 결산 RPC 확장 + get_report_list 형상 관리 정상화
-- 기존 필드 모두 유지(Edge Function 하위 호환) + 신규 필드 추가
-- 반환 타입: jsonb (단일 객체 — TS 코드에서 data.field 로 접근)

CREATE OR REPLACE FUNCTION get_monthly_report_data(
  p_user_id UUID,
  p_year    INT,
  p_month   INT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_start       TIMESTAMPTZ;
  v_end         TIMESTAMPTZ;
  v_prev_start  TIMESTAMPTZ;
  v_prev_end    TIMESTAMPTZ;
  v_avg3_start  TIMESTAMPTZ;
  v_py_start    TIMESTAMPTZ;
  v_py_end      TIMESTAMPTZ;

  -- 현재 월 기본 집계
  v_total_income      BIGINT := 0;
  v_total_expense     BIGINT := 0;
  v_transaction_count INT    := 0;
  v_peak_day          INT;
  v_peak_weekday      INT;
  v_daily_expenses    JSONB;
  v_top_categories    JSONB;
  v_max_expense       JSONB;

  -- 신규 필드
  v_prev_month_income   BIGINT := 0;
  v_prev_month_expense  BIGINT := 0;
  v_avg3_income         BIGINT := 0;
  v_avg3_expense        BIGINT := 0;
  v_prev_year_income    BIGINT;
  v_prev_year_expense   BIGINT;
  v_asset_breakdown     JSONB;
  v_recurring_expense   BIGINT := 0;
  v_variable_expense    BIGINT := 0;
  v_recurring_income    BIGINT := 0;
  v_variable_income     BIGINT := 0;
  v_prev_top_categories JSONB;
  v_weekday_expenses    JSONB;
  v_top_transactions    JSONB;
BEGIN
  -- 월 경계 (KST 자정 기준)
  v_start      := make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'Asia/Seoul');
  v_end        := v_start + INTERVAL '1 month';
  v_prev_start := v_start - INTERVAL '1 month';
  v_prev_end   := v_start;
  v_avg3_start := v_start - INTERVAL '3 months';
  v_py_start   := v_start - INTERVAL '1 year';
  v_py_end     := v_py_start + INTERVAL '1 month';

  -- ① 현재 월 기본 집계
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::BIGINT,
    COUNT(*)::INT
  INTO v_total_income, v_total_expense, v_transaction_count
  FROM public.transactions
  WHERE user_id = p_user_id
    AND transaction_at >= v_start
    AND transaction_at <  v_end;

  -- ② 피크 날 (지출 기준)
  SELECT EXTRACT(DAY FROM transaction_at AT TIME ZONE 'Asia/Seoul')::INT
  INTO v_peak_day
  FROM public.transactions
  WHERE user_id = p_user_id
    AND type = 'expense'
    AND transaction_at >= v_start
    AND transaction_at <  v_end
  GROUP BY 1
  ORDER BY SUM(amount) DESC
  LIMIT 1;

  -- ③ 피크 요일 (0=일 ~ 6=토, 지출 기준)
  SELECT EXTRACT(DOW FROM transaction_at AT TIME ZONE 'Asia/Seoul')::INT
  INTO v_peak_weekday
  FROM public.transactions
  WHERE user_id = p_user_id
    AND type = 'expense'
    AND transaction_at >= v_start
    AND transaction_at <  v_end
  GROUP BY 1
  ORDER BY SUM(amount) DESC
  LIMIT 1;

  -- ④ 일별 지출
  SELECT jsonb_agg(jsonb_build_object('day', day, 'amount', amount) ORDER BY day)
  INTO v_daily_expenses
  FROM (
    SELECT
      EXTRACT(DAY FROM transaction_at AT TIME ZONE 'Asia/Seoul')::INT AS day,
      SUM(amount)::BIGINT AS amount
    FROM public.transactions
    WHERE user_id = p_user_id
      AND type = 'expense'
      AND transaction_at >= v_start
      AND transaction_at <  v_end
    GROUP BY 1
  ) d;

  -- ⑤ 카테고리 TOP 5 (지출 기준)
  SELECT jsonb_agg(row ORDER BY row->>'amount' DESC)
  INTO v_top_categories
  FROM (
    SELECT jsonb_build_object(
      'id', cat.id,
      'name', cat.name,
      'color', cat.color,
      'amount', SUM(t.amount)::BIGINT,
      'count', COUNT(*)::INT
    ) AS row
    FROM public.transactions t
    JOIN public.categories cat ON cat.id = t.category_id
    WHERE t.user_id = p_user_id
      AND t.type = 'expense'
      AND t.category_id IS NOT NULL
      AND t.transaction_at >= v_start
      AND t.transaction_at <  v_end
    GROUP BY cat.id, cat.name, cat.color
    ORDER BY SUM(t.amount) DESC
    LIMIT 5
  ) s;

  -- ⑥ 최대 단일 지출
  SELECT jsonb_build_object(
    'amount', t.amount::BIGINT,
    'description', t.description,
    'category_name', COALESCE(cat.name, ''),
    'category_color', COALESCE(cat.color, '#888888'),
    'day', EXTRACT(DAY FROM t.transaction_at AT TIME ZONE 'Asia/Seoul')::INT
  )
  INTO v_max_expense
  FROM public.transactions t
  LEFT JOIN public.categories cat ON cat.id = t.category_id
  WHERE t.user_id = p_user_id
    AND t.type = 'expense'
    AND t.transaction_at >= v_start
    AND t.transaction_at <  v_end
  ORDER BY t.amount DESC
  LIMIT 1;

  -- ⑦ 전월 집계
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::BIGINT
  INTO v_prev_month_income, v_prev_month_expense
  FROM public.transactions
  WHERE user_id = p_user_id
    AND transaction_at >= v_prev_start
    AND transaction_at <  v_prev_end;

  -- ⑧ 직전 3개월 평균 (현재 월 미포함)
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) / 3, 0)::BIGINT,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) / 3, 0)::BIGINT
  INTO v_avg3_income, v_avg3_expense
  FROM public.transactions
  WHERE user_id = p_user_id
    AND transaction_at >= v_avg3_start
    AND transaction_at <  v_start;

  -- ⑨ 전년 동월
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::BIGINT
  INTO v_prev_year_income, v_prev_year_expense
  FROM public.transactions
  WHERE user_id = p_user_id
    AND transaction_at >= v_py_start
    AND transaction_at <  v_py_end;

  -- ⑩ 자산별 변동
  SELECT jsonb_agg(jsonb_build_object(
    'asset_id', a.id,
    'asset_name', a.name,
    'asset_type', a.type,
    'income', t.income,
    'expense', t.expense,
    'count', t.cnt
  ) ORDER BY t.expense DESC)
  INTO v_asset_breakdown
  FROM (
    SELECT
      asset_id,
      COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0)::BIGINT AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::BIGINT AS expense,
      COUNT(*)::INT AS cnt
    FROM public.transactions
    WHERE user_id = p_user_id
      AND asset_id IS NOT NULL
      AND transaction_at >= v_start
      AND transaction_at <  v_end
    GROUP BY asset_id
  ) t
  JOIN public.assets a ON a.id = t.asset_id;

  -- ⑪ 고정비 vs 변동비 (recurring_id IS NULL 여부로 구분)
  SELECT
    COALESCE(SUM(CASE WHEN type = 'expense' AND recurring_id IS NOT NULL THEN amount ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(CASE WHEN type = 'expense' AND recurring_id IS NULL     THEN amount ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(CASE WHEN type = 'income'  AND recurring_id IS NOT NULL THEN amount ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(CASE WHEN type = 'income'  AND recurring_id IS NULL     THEN amount ELSE 0 END), 0)::BIGINT
  INTO v_recurring_expense, v_variable_expense, v_recurring_income, v_variable_income
  FROM public.transactions
  WHERE user_id = p_user_id
    AND transaction_at >= v_start
    AND transaction_at <  v_end;

  -- ⑫ 전월 카테고리별 지출 (현재 월 카테고리와 비교용)
  SELECT jsonb_agg(jsonb_build_object('id', category_id, 'amount', amount))
  INTO v_prev_top_categories
  FROM (
    SELECT
      category_id,
      SUM(amount)::BIGINT AS amount
    FROM public.transactions
    WHERE user_id = p_user_id
      AND type = 'expense'
      AND category_id IS NOT NULL
      AND transaction_at >= v_prev_start
      AND transaction_at <  v_prev_end
    GROUP BY category_id
  ) pc;

  -- ⑬ 요일별 지출 (일~토, 0~6, 없는 요일은 0)
  SELECT jsonb_agg(jsonb_build_object('wd', gs.wd, 'amount', COALESCE(w.amount, 0)) ORDER BY gs.wd)
  INTO v_weekday_expenses
  FROM generate_series(0, 6) AS gs(wd)
  LEFT JOIN (
    SELECT
      EXTRACT(DOW FROM transaction_at AT TIME ZONE 'Asia/Seoul')::INT AS wd,
      SUM(amount)::BIGINT AS amount
    FROM public.transactions
    WHERE user_id = p_user_id
      AND type = 'expense'
      AND transaction_at >= v_start
      AND transaction_at <  v_end
    GROUP BY 1
  ) w ON w.wd = gs.wd;

  -- ⑭ Top 5 개별 거래 (금액 내림차순)
  SELECT jsonb_agg(jsonb_build_object(
    'id', tx.id,
    'amount', tx.amount::BIGINT,
    'description', tx.description,
    'day', EXTRACT(DAY FROM tx.transaction_at AT TIME ZONE 'Asia/Seoul')::INT,
    'category_name', COALESCE(cat.name, ''),
    'category_color', COALESCE(cat.color, '#888888'),
    'asset_name', COALESCE(a.name, '')
  ) ORDER BY tx.amount DESC)
  INTO v_top_transactions
  FROM (
    SELECT id, amount, description, transaction_at, category_id, asset_id
    FROM public.transactions
    WHERE user_id = p_user_id
      AND type = 'expense'
      AND transaction_at >= v_start
      AND transaction_at <  v_end
    ORDER BY amount DESC
    LIMIT 5
  ) tx
  LEFT JOIN public.categories cat ON cat.id = tx.category_id
  LEFT JOIN public.assets a ON a.id = tx.asset_id;

  RETURN jsonb_build_object(
    -- 기존 필드 (하위 호환 유지)
    'total_income',      v_total_income,
    'total_expense',     v_total_expense,
    'transaction_count', v_transaction_count,
    'top_categories',    COALESCE(v_top_categories, '[]'::jsonb),
    'peak_day',          v_peak_day,
    'peak_weekday',      v_peak_weekday,
    'daily_expenses',    COALESCE(v_daily_expenses, '[]'::jsonb),
    'max_expense',       v_max_expense,
    -- 신규 필드
    'prev_month_income',    v_prev_month_income,
    'prev_month_expense',   v_prev_month_expense,
    'avg3_income',          v_avg3_income,
    'avg3_expense',         v_avg3_expense,
    'prev_year_income',     v_prev_year_income,
    'prev_year_expense',    v_prev_year_expense,
    'asset_breakdown',      COALESCE(v_asset_breakdown, '[]'::jsonb),
    'recurring_expense',    v_recurring_expense,
    'variable_expense',     v_variable_expense,
    'recurring_income',     v_recurring_income,
    'variable_income',      v_variable_income,
    'prev_top_categories',  COALESCE(v_prev_top_categories, '[]'::jsonb),
    'weekday_expenses',     COALESCE(v_weekday_expenses, '[]'::jsonb),
    'top_transactions',     COALESCE(v_top_transactions, '[]'::jsonb)
  );
END;
$$;

-- =============================================
-- get_report_list: 거래 있는 월 최대 12개 (내림차순)
-- 형상 관리 정상화 — 코드에서 이미 호출 중이었으나 마이그레이션 파일에 없었음
-- =============================================
CREATE OR REPLACE FUNCTION get_report_list(
  p_user_id UUID
)
RETURNS TABLE(
  year          INT,
  month         INT,
  total_income  BIGINT,
  total_expense BIGINT
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    EXTRACT(YEAR  FROM transaction_at AT TIME ZONE 'Asia/Seoul')::INT AS year,
    EXTRACT(MONTH FROM transaction_at AT TIME ZONE 'Asia/Seoul')::INT AS month,
    COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0)::BIGINT AS total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::BIGINT AS total_expense
  FROM public.transactions
  WHERE user_id = p_user_id
  GROUP BY 1, 2
  ORDER BY 1 DESC, 2 DESC
  LIMIT 12;
$$;
