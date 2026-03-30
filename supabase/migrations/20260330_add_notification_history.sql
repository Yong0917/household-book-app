-- =============================================
-- 알림 히스토리 테이블 (사용자에게 표시되는 수신 알림 목록)
-- =============================================
CREATE TABLE IF NOT EXISTS public.notification_history (
  id       uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id  uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type     text        NOT NULL CHECK (type IN ('recurring', 'monthly_summary', 'monthly_report')),
  title    text        NOT NULL,
  body     text        NOT NULL,
  data     jsonb       DEFAULT '{}'::jsonb,
  sent_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX notification_history_user_sent_idx
  ON public.notification_history (user_id, sent_at DESC);

ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- 본인 알림만 조회 가능
CREATE POLICY "본인 알림 히스토리 조회" ON public.notification_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT는 service_role만 가능 (Edge Function에서 사용, RLS bypass)
