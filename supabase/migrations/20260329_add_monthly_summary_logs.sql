-- =============================================
-- 월말 미처리 고정비 알림 발송 로그 (중복 방지)
-- =============================================
CREATE TABLE IF NOT EXISTS public.monthly_summary_logs (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year       integer     NOT NULL,
  month      integer     NOT NULL,
  sent_at    timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, year, month)
);

ALTER TABLE public.monthly_summary_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "서비스 롤만 월말 요약 로그 접근" ON public.monthly_summary_logs
  FOR ALL
  USING (false);
