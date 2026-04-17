import { createClient } from "@/lib/supabase/server";
import SplashScreen from "@/components/SplashScreen";

export default async function Home() {
  const supabase = await createClient();
  // getSession()은 로컬 쿠키만 읽어 라운드트립이 없다. 만료된 토큰은 갱신되지 않지만,
  // 보호 경로 진입 시 미들웨어의 getUser()가 다시 갱신/검증한다.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const destination = session ? "/ledger/daily" : "/auth/login";

  return <SplashScreen destination={destination} />;
}
