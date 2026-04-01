"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AccessStatus = "admin" | "approved" | "pending" | "denied" | "none";

export interface AccessRequest {
  id: string;
  user_id: string;
  email: string;
  status: "pending" | "approved" | "denied";
  requested_at: string;
  reviewed_at: string | null;
}

/** 현재 유저의 영수증 스캔 접근 상태 조회 */
export async function getReceiptAccessStatus(): Promise<AccessStatus> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) return "none";

  const userId = authData.claims.sub as string;

  // 관리자 여부 확인
  if (userId === process.env.ADMIN_USER_ID) return "admin";

  const { data } = await supabase
    .from("receipt_scan_access")
    .select("status")
    .eq("user_id", userId)
    .single();

  if (!data) return "none";
  return data.status as AccessStatus;
}

/** 현재 유저가 영수증 스캔 접근 요청 */
export async function requestReceiptAccess(): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다");

  const userId = authData.claims.sub as string;
  const email = authData.claims.email as string;

  const { error } = await supabase.from("receipt_scan_access").insert({
    user_id: userId,
    email,
    status: "pending",
  });

  if (error) throw new Error(error.message);
}

/** [관리자 전용] 전체 요청 목록 조회 */
export async function getAccessRequests(): Promise<AccessRequest[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData || (authData.claims.sub as string) !== process.env.ADMIN_USER_ID) {
    throw new Error("관리자 권한이 필요합니다");
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("receipt_scan_access")
    .select("*")
    .order("requested_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AccessRequest[];
}

/** [관리자 전용] 요청 승인 또는 거부 */
export async function reviewAccessRequest(
  requestId: string,
  action: "approved" | "denied"
): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData || (authData.claims.sub as string) !== process.env.ADMIN_USER_ID) {
    throw new Error("관리자 권한이 필요합니다");
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("receipt_scan_access")
    .update({ status: action, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
}
