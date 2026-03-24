-- =============================================
-- 회원탈퇴 유예기간 관리 테이블
-- =============================================

-- 탈퇴 요청 테이블 (30일 유예기간 동안 보관)
CREATE TABLE IF NOT EXISTS public.user_deletion_requests (
  user_id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at         timestamptz NOT NULL DEFAULT now(),
  scheduled_deletion_at timestamptz NOT NULL DEFAULT now() + interval '30 days'
);

ALTER TABLE public.user_deletion_requests ENABLE ROW LEVEL SECURITY;

-- 본인의 탈퇴 요청만 조회/삭제 가능
CREATE POLICY "본인 탈퇴 요청만 접근" ON public.user_deletion_requests
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
