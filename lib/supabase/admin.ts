import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * RLS를 우회하는 서비스 롤 클라이언트 (관리자 전용 서버 사이드 작업에만 사용)
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
