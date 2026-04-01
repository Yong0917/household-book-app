-- 영수증 스캔 기능 접근 권한 테이블
create table if not exists receipt_scan_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  status text not null check (status in ('pending', 'approved', 'denied')) default 'pending',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- 유저당 하나의 요청만 허용
create unique index if not exists receipt_scan_access_user_id_idx on receipt_scan_access(user_id);

-- RLS 활성화
alter table receipt_scan_access enable row level security;

-- 자신의 레코드만 조회 가능 (일반 유저)
create policy "Users can view own access record"
  on receipt_scan_access for select
  using (auth.uid() = user_id);

-- 자신의 요청만 삽입 가능 (일반 유저)
create policy "Users can insert own access request"
  on receipt_scan_access for insert
  with check (auth.uid() = user_id);
