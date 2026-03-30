import { createClient } from "npm:@supabase/supabase-js@2";
import { JWT } from "npm:google-auth-library@9";

const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!) as {
  project_id: string;
  client_email: string;
  private_key: string;
};

// =============================================
// 월별 결산 리포트 알림 Edge Function
// 매월 1일 KST 10:00 (UTC 01:00) 크론으로 호출됨
// 전월 결산 데이터를 집계하여 사용자에게 알림 발송
// 고정비 알림(send-recurring-notifications)과 완전히 분리
// =============================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// FCM V1 API용 OAuth2 액세스 토큰 발급
async function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
    jwtClient.authorize((err, tokens) => {
      if (err) { reject(err); return; }
      resolve(tokens!.access_token!);
    });
  });
}

// FCM V1 API로 단일 토큰에 푸시 발송
async function sendFcmMessage(
  accessToken: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<boolean> {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          android: {
            priority: "high",
            notification: {
              icon: "ic_launcher",
              color: "#10b981",
              click_action: "OPEN_REPORT",
            },
          },
          data,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    console.error("[FCM V1 오류]", JSON.stringify(err));
    return false;
  }
  return true;
}

// 금액을 간결하게 포맷 (만원 단위)
function formatAmount(amount: number): string {
  if (amount >= 100000000) {
    return `${Math.round(amount / 100000000)}억원`;
  }
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const rest = amount % 10000;
    if (rest === 0) return `${man.toLocaleString()}만원`;
    return `${man.toLocaleString()}만 ${rest.toLocaleString()}원`;
  }
  return `${amount.toLocaleString()}원`;
}

// 전월 대비 증감률 계산
function formatChange(current: number, prev: number): string | null {
  if (prev === 0) return null;
  const diff = current - prev;
  const pct = Math.round(Math.abs((diff / prev) * 100));
  if (pct === 0) return "전월과 동일";
  return `전월 대비 ${pct}% ${diff > 0 ? "증가" : "감소"}`;
}

type RpcResult = {
  total_income: number;
  total_expense: number;
  transaction_count: number;
  top_categories: Array<{ id: string; name: string; color: string; amount: number; count: number }> | null;
  peak_day: number | null;
  peak_weekday: number | null;
  daily_expenses: Array<{ day: number; amount: number }> | null;
};

Deno.serve(async (req) => {
  // 서비스 롤 토큰으로만 접근 허용
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // KST 기준 오늘 = 매월 1일 → 전월 계산
  const nowUTC = new Date();
  const nowKST = new Date(nowUTC.getTime() + 9 * 60 * 60 * 1000);
  const todayMonth = nowKST.getUTCMonth() + 1; // 현재월 (1~12)
  const todayYear  = nowKST.getUTCFullYear();

  const prevMonth = todayMonth === 1 ? 12 : todayMonth - 1;
  const prevYear  = todayMonth === 1 ? todayYear - 1 : todayYear;
  const prevPrevMonth = prevMonth === 1 ? 12 : prevMonth - 1;
  const prevPrevYear  = prevMonth === 1 ? prevYear - 1 : prevYear;

  // 이미 이번 달(1일)에 발송된 사용자 조회
  const { data: alreadySent } = await supabase
    .from("monthly_report_logs")
    .select("user_id")
    .eq("year", prevYear)
    .eq("month", prevMonth);

  const sentUserIds = new Set((alreadySent ?? []).map((r: { user_id: string }) => r.user_id));

  // 전월에 거래가 있는 사용자 목록 조회
  const prevMonthStart = new Date(Date.UTC(prevYear, prevMonth - 1, 1) - 9 * 60 * 60 * 1000).toISOString();
  const prevMonthEnd   = new Date(Date.UTC(prevYear, prevMonth,     1) - 9 * 60 * 60 * 1000).toISOString();

  const { data: activeUsers } = await supabase
    .from("transactions")
    .select("user_id")
    .gte("transaction_at", prevMonthStart)
    .lt("transaction_at", prevMonthEnd);

  if (!activeUsers || activeUsers.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "전월 거래 사용자 없음" }));
  }

  // 중복 제거 + 이미 발송된 사용자 제외
  const uniqueUserIds = [
    ...new Set(
      (activeUsers as { user_id: string }[])
        .map((r) => r.user_id)
        .filter((id) => !sentUserIds.has(id))
    ),
  ];

  if (uniqueUserIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "발송 대상 없음 (모두 이미 발송)" }));
  }

  // 대상 사용자 FCM 토큰 조회
  const { data: tokenRows } = await supabase
    .from("device_tokens")
    .select("user_id, token")
    .in("user_id", uniqueUserIds)
    .eq("platform", "android");

  const tokenMap = new Map<string, string[]>();
  for (const row of tokenRows ?? []) {
    const r = row as { user_id: string; token: string };
    if (!tokenMap.has(r.user_id)) tokenMap.set(r.user_id, []);
    tokenMap.get(r.user_id)!.push(r.token);
  }

  // FCM 토큰 있는 사용자만 필터
  const targetUserIds = uniqueUserIds.filter((id) => (tokenMap.get(id)?.length ?? 0) > 0);

  if (targetUserIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: "FCM 토큰 없음" }));
  }

  const accessToken = await getAccessToken();
  const logInserts: { user_id: string; year: number; month: number }[] = [];
  let sentCount = 0;

  for (const userId of targetUserIds) {
    // 전월 + 전전월 리포트 데이터 병렬 조회
    const [{ data: current }, { data: prev }] = await Promise.all([
      supabase.rpc("get_monthly_report_data", {
        p_user_id: userId,
        p_year: prevYear,
        p_month: prevMonth,
      }),
      supabase.rpc("get_monthly_report_data", {
        p_user_id: userId,
        p_year: prevPrevYear,
        p_month: prevPrevMonth,
      }),
    ]);

    if (!current) continue;

    const c = current as RpcResult;
    const p = prev as RpcResult | null;

    const totalExpense = Number(c.total_expense);
    const prevExpense  = p ? Number(p.total_expense) : 0;

    // 알림 제목
    const title = `머니로그 - ${prevMonth}월 결산`;

    // 알림 본문 구성
    const lines: string[] = [];
    const changeStr = formatChange(totalExpense, prevExpense);
    lines.push(`지출 ${formatAmount(totalExpense)}${changeStr ? ` · ${changeStr}` : ""}`);

    // TOP 2 카테고리 표시
    const top = (c.top_categories ?? []).slice(0, 2);
    if (top.length > 0) {
      lines.push(top.map((cat) => `${cat.name} ${formatAmount(Number(cat.amount))}`).join(" · "));
    }

    const body = lines.join("\n");

    const tokens = tokenMap.get(userId) ?? [];
    const results = await Promise.all(
      tokens.map((token) =>
        sendFcmMessage(accessToken, token, title, body, {
          type:   "monthly_report",
          screen: `/statistics/report/${prevYear}/${prevMonth}`,
          year:   String(prevYear),
          month:  String(prevMonth),
        })
      )
    );

    if (results.some(Boolean)) {
      sentCount++;
      logInserts.push({ user_id: userId, year: prevYear, month: prevMonth });
    }
  }

  // 발송 로그 저장
  if (logInserts.length > 0) {
    await supabase
      .from("monthly_report_logs")
      .upsert(logInserts, { onConflict: "user_id,year,month" });
  }

  // 알림 히스토리 저장 (사용자에게 표시)
  // logInserts에는 발송 성공한 user_id만 담겨있음
  const historyInserts = await Promise.all(
    logInserts.map(async ({ user_id }) => {
      const [{ data: current }, { data: prev }] = await Promise.all([
        supabase.rpc("get_monthly_report_data", {
          p_user_id: user_id,
          p_year: prevYear,
          p_month: prevMonth,
        }),
        supabase.rpc("get_monthly_report_data", {
          p_user_id: user_id,
          p_year: prevPrevYear,
          p_month: prevPrevMonth,
        }),
      ]);

      const c = current as RpcResult | null;
      const p = prev as RpcResult | null;

      const totalExpense = c ? Number(c.total_expense) : 0;
      const prevExpense  = p ? Number(p.total_expense) : 0;

      const lines: string[] = [];
      const changeStr = formatChange(totalExpense, prevExpense);
      lines.push(`지출 ${formatAmount(totalExpense)}${changeStr ? ` · ${changeStr}` : ""}`);
      const top = ((c?.top_categories) ?? []).slice(0, 2);
      if (top.length > 0) {
        lines.push(top.map((cat) => `${cat.name} ${formatAmount(Number(cat.amount))}`).join(" · "));
      }

      return {
        user_id,
        type:    "monthly_report",
        title:   `머니로그 - ${prevMonth}월 결산`,
        body:    lines.join("\n"),
        data:    { screen: `/statistics/report/${prevYear}/${prevMonth}`, year: String(prevYear), month: String(prevMonth) },
        sent_at: new Date().toISOString(),
      };
    })
  );

  if (historyInserts.length > 0) {
    await supabase.from("notification_history").insert(historyInserts);
  }

  return new Response(
    JSON.stringify({ sent: sentCount, total: targetUserIds.length }),
    { headers: { "Content-Type": "application/json" } }
  );
});
