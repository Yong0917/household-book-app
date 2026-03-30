import { createClient } from "npm:@supabase/supabase-js@2";
import { JWT } from "npm:google-auth-library@9";

const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!) as {
  project_id: string;
  client_email: string;
  private_key: string;
};

// =============================================
// 고정비 푸시 알림 발송 Edge Function (FCM V1 API)
// 매일 KST 09:00 (UTC 00:00) cron으로 호출됨
// - 오늘 결제일인 고정비 → 개별 알림
// - 월 마지막 날 → 이번 달 미처리 고정비 요약 알림
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
              color: "#6366F1",
              click_action: "OPEN_LEDGER",
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

// KST 기준 오늘이 월의 마지막 날인지 확인
function isLastDayOfMonth(kstDate: Date): boolean {
  const tomorrow = new Date(kstDate.getTime() + 24 * 60 * 60 * 1000);
  return tomorrow.getUTCMonth() !== kstDate.getUTCMonth();
}

Deno.serve(async (req) => {
  // mode: "daily" → 오늘 결제일 개별 알림 (KST 15:00)
  // mode: "monthly_summary" → 월말 미처리 요약 알림 (KST 20:00)
  const body = await req.json().catch(() => ({}));
  const mode: string = body.mode ?? "daily";

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // KST 기준 오늘 날짜 계산
  const nowUTC = new Date();
  const nowKST = new Date(nowUTC.getTime() + 9 * 60 * 60 * 1000);
  const todayDay   = nowKST.getUTCDate();
  const todayYear  = nowKST.getUTCFullYear();
  const todayMonth = nowKST.getUTCMonth() + 1;

  // KST 월 범위 → UTC
  const monthStart = new Date(Date.UTC(todayYear, todayMonth - 1, 1) - 9 * 60 * 60 * 1000).toISOString();
  const monthEnd   = new Date(Date.UTC(todayYear, todayMonth,     1) - 9 * 60 * 60 * 1000).toISOString();

  // monthly_summary 모드면 개별 알림 건너뜀
  if (mode === "monthly_summary" && !isLastDayOfMonth(nowKST)) {
    return new Response(JSON.stringify({ skipped: true, message: "오늘은 월 마지막 날이 아님" }));
  }

  // ① 오늘 결제일인 활성 고정비 조회 (daily 모드만)
  const { data: recurringList, error: rErr } = mode === "daily"
    ? await supabase
        .from("recurring_transactions")
        .select("id, user_id, type, amount, description, day_of_month, categories(name)")
        .eq("is_active", true)
        .eq("day_of_month", todayDay)
    : { data: [], error: null };

  if (rErr) {
    console.error("[recurring query]", rErr.message);
    return new Response(JSON.stringify({ error: rErr.message }), { status: 500 });
  }

  // ② 이미 처리/건너뜀/알림발송된 항목 조회 (중복 방지)
  const [{ data: processed }, { data: skipped }, { data: alreadyNotified }] = await Promise.all([
    supabase
      .from("transactions")
      .select("recurring_id, user_id")
      .gte("transaction_at", monthStart)
      .lt("transaction_at", monthEnd)
      .not("recurring_id", "is", null),
    supabase
      .from("recurring_skips")
      .select("recurring_id, user_id")
      .eq("year", todayYear)
      .eq("month", todayMonth),
    supabase
      .from("notification_logs")
      .select("recurring_id, user_id")
      .eq("year", todayYear)
      .eq("month", todayMonth),
  ]);

  const excludeSet = new Set([
    ...(processed      ?? []).map((r) => `${r.user_id}:${r.recurring_id}`),
    ...(skipped        ?? []).map((s) => `${s.user_id}:${s.recurring_id}`),
    ...(alreadyNotified ?? []).map((n) => `${n.user_id}:${n.recurring_id}`),
  ]);

  // ③ 실제 알림 대상 필터
  const targets = (recurringList ?? []).filter((r) => !excludeSet.has(`${r.user_id}:${r.id}`));

  let sentCount = 0;
  let accessToken: string | null = null;

  // ④ 오늘 결제일 고정비 개별 알림
  if (targets.length > 0) {
    const targetUserIds = [...new Set(targets.map((t) => t.user_id))];
    const { data: tokenRows } = await supabase
      .from("device_tokens")
      .select("user_id, token")
      .in("user_id", targetUserIds)
      .eq("platform", "android");

    const tokenMap = new Map<string, string[]>();
    for (const row of tokenRows ?? []) {
      if (!tokenMap.has(row.user_id)) tokenMap.set(row.user_id, []);
      tokenMap.get(row.user_id)!.push(row.token);
    }

    accessToken = await getAccessToken();
    const logInserts: { user_id: string; recurring_id: string; year: number; month: number }[] = [];

    for (const r of targets) {
      const tokens = tokenMap.get(r.user_id);
      if (!tokens || tokens.length === 0) continue;

      const categoryName = (r.categories as { name: string } | null)?.name ?? "";
      const label     = r.description || categoryName || "고정비";
      const amountStr = Number(r.amount).toLocaleString("ko-KR");
      const typeLabel = r.type === "income" ? "수입" : "지출";
      const body      = `${label} ${amountStr}원 ${typeLabel} 결제일이에요`;

      const results = await Promise.all(
        tokens.map((token) =>
          sendFcmMessage(accessToken!, token, "머니로그", body, {
            type:        "recurring",
            recurringId: r.id,
            screen:      "/ledger/daily",
          })
        )
      );

      if (results.some(Boolean)) {
        sentCount++;
        logInserts.push({ user_id: r.user_id, recurring_id: r.id, year: todayYear, month: todayMonth });
      }
    }

    if (logInserts.length > 0) {
      await supabase
        .from("notification_logs")
        .upsert(logInserts, { onConflict: "user_id,recurring_id,year,month" });
    }

    // 알림 히스토리 저장 (사용자에게 표시)
    const historyInserts = targets
      .filter((r) => {
        const tokens = tokenMap.get(r.user_id);
        return tokens && tokens.length > 0;
      })
      .map((r) => {
        const categoryName = (r.categories as { name: string } | null)?.name ?? "";
        const label     = r.description || categoryName || "고정비";
        const amountStr = Number(r.amount).toLocaleString("ko-KR");
        const typeLabel = r.type === "income" ? "수입" : "지출";
        return {
          user_id: r.user_id,
          type:    "recurring",
          title:   "머니로그",
          body:    `${label} ${amountStr}원 ${typeLabel} 결제일이에요`,
          data:    { recurringId: r.id, screen: "/ledger/daily" },
          sent_at: new Date().toISOString(),
        };
      });

    if (historyInserts.length > 0) {
      await supabase.from("notification_history").insert(historyInserts);
    }
  }

  // ⑤ 월말 미처리 고정비 요약 알림 (monthly_summary 모드에서만 실행)
  let summarySentCount = 0;
  if (mode === "monthly_summary") {
    // 이번 달 활성 고정비 전체 조회
    const { data: allRecurring } = await supabase
      .from("recurring_transactions")
      .select("id, user_id")
      .eq("is_active", true);

    // 이번 달에 이미 월말 요약 알림 보낸 사용자 조회
    const { data: alreadySummarized } = await supabase
      .from("monthly_summary_logs")
      .select("user_id")
      .eq("year", todayYear)
      .eq("month", todayMonth);

    const summarizedUserIds = new Set((alreadySummarized ?? []).map((r) => r.user_id));

    // 사용자별 미처리 고정비 집계
    const unprocessedMap = new Map<string, number>();
    for (const r of allRecurring ?? []) {
      if (summarizedUserIds.has(r.user_id)) continue;
      const key = `${r.user_id}:${r.id}`;
      // 처리됨(거래 등록) 또는 건너뜀이면 제외
      if (excludeSet.has(key)) continue;
      unprocessedMap.set(r.user_id, (unprocessedMap.get(r.user_id) ?? 0) + 1);
    }

    if (unprocessedMap.size > 0) {
      const summaryUserIds = [...unprocessedMap.keys()];
      const { data: summaryTokenRows } = await supabase
        .from("device_tokens")
        .select("user_id, token")
        .in("user_id", summaryUserIds)
        .eq("platform", "android");

      const summaryTokenMap = new Map<string, string[]>();
      for (const row of summaryTokenRows ?? []) {
        if (!summaryTokenMap.has(row.user_id)) summaryTokenMap.set(row.user_id, []);
        summaryTokenMap.get(row.user_id)!.push(row.token);
      }

      if (!accessToken) accessToken = await getAccessToken();
      const summaryLogInserts: { user_id: string; year: number; month: number }[] = [];

      for (const [userId, count] of unprocessedMap) {
        const tokens = summaryTokenMap.get(userId);
        if (!tokens || tokens.length === 0) continue;

        const body = `이번 달 미처리 고정비가 ${count}개 있어요 · 확인해보세요`;

        const results = await Promise.all(
          tokens.map((token) =>
            sendFcmMessage(accessToken!, token, "머니로그", body, {
              type:   "monthly_summary",
              screen: "/ledger/daily",
            })
          )
        );

        if (results.some(Boolean)) {
          summarySentCount++;
          summaryLogInserts.push({ user_id: userId, year: todayYear, month: todayMonth });
        }
      }

      if (summaryLogInserts.length > 0) {
        await supabase
          .from("monthly_summary_logs")
          .upsert(summaryLogInserts, { onConflict: "user_id,year,month" });
      }

      // 월말 요약 알림 히스토리 저장
      const summaryHistoryInserts = summaryLogInserts.map(({ user_id }) => {
        const count = unprocessedMap.get(user_id) ?? 0;
        return {
          user_id,
          type:    "monthly_summary",
          title:   "머니로그",
          body:    `이번 달 미처리 고정비가 ${count}개 있어요 · 확인해보세요`,
          data:    { screen: "/ledger/daily" },
          sent_at: new Date().toISOString(),
        };
      });

      if (summaryHistoryInserts.length > 0) {
        await supabase.from("notification_history").insert(summaryHistoryInserts);
      }
    }
  }

  return new Response(
    JSON.stringify({ sent: sentCount, summarySent: summarySentCount, total: targets.length }),
    { headers: { "Content-Type": "application/json" } }
  );
});
