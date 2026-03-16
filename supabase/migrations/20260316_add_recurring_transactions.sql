-- 고정비 테이블 생성
CREATE TABLE recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric NOT NULL CHECK (amount > 0),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  description text,
  day_of_month int NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- transactions 테이블에 recurring_id 컬럼 추가
ALTER TABLE transactions
  ADD COLUMN recurring_id uuid REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- RLS 활성화 및 정책 설정
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_recurring ON recurring_transactions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
