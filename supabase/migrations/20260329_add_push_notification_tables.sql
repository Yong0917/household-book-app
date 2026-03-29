-- =============================================
-- FCM 디바이스 토큰 저장 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token      text        NOT NULL,
  platform   text        NOT NULL DEFAULT 'android' CHECK (platform IN ('android', 'ios', 'web')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, token)
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 디바이스 토큰만 접근" ON public.device_tokens
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 알림 발송 로그 (중복 발송 방지)
-- =============================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recurring_id   uuid        REFERENCES public.recurring_transactions(id) ON DELETE CASCADE NOT NULL,
  year           integer     NOT NULL,
  month          integer     NOT NULL,
  sent_at        timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, recurring_id, year, month)
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "서비스 롤만 알림 로그 접근" ON public.notification_logs
  FOR ALL
  USING (false);

-- service_role은 RLS bypass → Edge Function에서 사용 가능
