import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  // getSession()은 로컬 쿠키만 읽어 라운드트립 없음. 만료된 토큰은 갱신되지 않지만,
  // 보호 경로 진입 시 미들웨어의 getUser()가 다시 갱신/검증한다.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  redirect(session ? "/ledger/daily" : "/auth/login");
}
