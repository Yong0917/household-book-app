-- =============================================
-- categories / assets sort_order 자동 할당 트리거
-- =============================================
-- 신규 행 INSERT 시 sort_order 가 NULL 이면 같은 사용자(+ type) 내 MAX+1 로 채움.
-- 기존엔 코드에서 사전 SELECT 1회 + INSERT 1회 (2 RTT) 로 처리하던 것을 1 RTT 로.

CREATE OR REPLACE FUNCTION public.assign_category_sort_order()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.sort_order IS NULL THEN
    SELECT COALESCE(MAX(sort_order), -1) + 1
      INTO NEW.sort_order
      FROM public.categories
     WHERE user_id = NEW.user_id AND type = NEW.type;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_categories_sort_order ON public.categories;
CREATE TRIGGER trg_categories_sort_order
  BEFORE INSERT ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.assign_category_sort_order();


CREATE OR REPLACE FUNCTION public.assign_asset_sort_order()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.sort_order IS NULL THEN
    SELECT COALESCE(MAX(sort_order), -1) + 1
      INTO NEW.sort_order
      FROM public.assets
     WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assets_sort_order ON public.assets;
CREATE TRIGGER trg_assets_sort_order
  BEFORE INSERT ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.assign_asset_sort_order();
