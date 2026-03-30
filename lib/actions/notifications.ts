"use server";

import { createClient } from "@/lib/supabase/server";

export type NotificationHistoryItem = {
  id: string;
  type: "recurring" | "monthly_summary" | "monthly_report";
  title: string;
  body: string;
  data: Record<string, string>;
  sent_at: string;
};

// 최근 알림 히스토리 조회 (최대 50건)
export async function getNotificationHistory(): Promise<NotificationHistoryItem[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) return [];

  const { data, error } = await supabase
    .from("notification_history")
    .select("id, type, title, body, data, sent_at")
    .order("sent_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[getNotificationHistory]", error.message);
    return [];
  }

  return data as NotificationHistoryItem[];
}

// FCM 디바이스 토큰을 DB에 저장 (upsert — 동일 토큰은 updated_at만 갱신)
export async function saveDeviceToken(token: string): Promise<void> {
  const supabase = await createClient();
  if (!token) return; // 빈 토큰 무시

  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) return; // 게스트 모드 무시

  const userId = authData.claims.sub as string;

  const { error } = await supabase.from("device_tokens").upsert(
    {
      user_id: userId,
      token,
      platform: "android",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,token" }
  );

  if (error) console.error("[saveDeviceToken]", error.message);
}

// FCM 토큰 삭제 (로그아웃 시 호출)
export async function removeDeviceToken(token: string): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) return;

  await supabase
    .from("device_tokens")
    .delete()
    .eq("user_id", authData.claims.sub as string)
    .eq("token", token);
}
