import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNowKST } from "@/lib/utils/timezone";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });

  const [
    { data: transactions },
    { data: categories },
    { data: assets },
    { data: recurringTransactions },
    { data: notes },
  ] = await Promise.all([
    supabase.from("transactions").select("*").order("transaction_at", { ascending: true }),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("assets").select("*").order("sort_order", { ascending: true }),
    supabase.from("recurring_transactions").select("*").order("created_at", { ascending: true }),
    supabase.from("notes").select("*").order("updated_at", { ascending: false }),
  ]);

  const payload = {
    version: "1.0",
    exported_at: new Date().toISOString(),
    data: {
      transactions: transactions ?? [],
      categories: categories ?? [],
      assets: assets ?? [],
      recurring_transactions: recurringTransactions ?? [],
      notes: notes ?? [],
    },
  };

  const json = JSON.stringify(payload, null, 2);

  // 파일명: 가계부_백업_YYYY-MM-DD.json (KST 기준)
  const kstNow = getNowKST();
  const dateStr = kstNow.toISOString().slice(0, 10);
  const filename = `가계부_백업_${dateStr}.json`;

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
