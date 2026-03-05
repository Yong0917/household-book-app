-- =============================================
-- 가계부 앱 초기 스키마 생성
-- =============================================

-- 1. categories 테이블
CREATE TABLE IF NOT EXISTS public.categories (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       text        NOT NULL,
  type       text        NOT NULL CHECK (type IN ('income', 'expense')),
  color      text        NOT NULL DEFAULT '#6B7280',
  is_default boolean     NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. assets 테이블
CREATE TABLE IF NOT EXISTS public.assets (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       text        NOT NULL,
  type       text        NOT NULL CHECK (type IN ('cash', 'bank', 'card', 'other')),
  is_default boolean     NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. transactions 테이블
CREATE TABLE IF NOT EXISTS public.transactions (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type           text        NOT NULL CHECK (type IN ('income', 'expense')),
  amount         numeric     NOT NULL CHECK (amount > 0),
  category_id    uuid        REFERENCES public.categories(id) ON DELETE SET NULL,
  asset_id       uuid        REFERENCES public.assets(id) ON DELETE SET NULL,
  description    text,
  transaction_at timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz DEFAULT now() NOT NULL
);

-- =============================================
-- RLS (Row Level Security) 활성화
-- =============================================

ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS 정책 (사용자 본인 데이터만 접근)
-- =============================================

-- categories
CREATE POLICY "본인 카테고리만 접근" ON public.categories
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- assets
CREATE POLICY "본인 자산만 접근" ON public.assets
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- transactions
CREATE POLICY "본인 거래만 접근" ON public.transactions
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 신규 사용자 기본 데이터 자동 생성 트리거
-- =============================================

CREATE OR REPLACE FUNCTION public.create_default_data_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 기본 지출 카테고리
  INSERT INTO public.categories (user_id, name, type, color, is_default) VALUES
    (NEW.id, '식비',     'expense', '#EF4444', true),
    (NEW.id, '교통',     'expense', '#F97316', true),
    (NEW.id, '쇼핑',     'expense', '#EAB308', true),
    (NEW.id, '의료',     'expense', '#22C55E', true),
    (NEW.id, '문화',     'expense', '#3B82F6', true),
    (NEW.id, '기타지출', 'expense', '#8B5CF6', true);

  -- 기본 수입 카테고리
  INSERT INTO public.categories (user_id, name, type, color, is_default) VALUES
    (NEW.id, '급여',   'income', '#22C55E', true),
    (NEW.id, '부수입', 'income', '#3B82F6', true);

  -- 기본 자산
  INSERT INTO public.assets (user_id, name, type, is_default) VALUES
    (NEW.id, '현금', 'cash', true),
    (NEW.id, '은행', 'bank', true),
    (NEW.id, '카드', 'card', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 제거 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_data_for_user();
