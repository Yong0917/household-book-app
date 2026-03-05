import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

const KST_OFFSET = 9 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const startMonth = searchParams.get("startMonth"); // "YYYY-MM"
  const endMonth = searchParams.get("endMonth");     // "YYYY-MM"

  let query = supabase
    .from("transactions")
    .select("id, type, amount, category_id, asset_id, description, transaction_at")
    .order("transaction_at", { ascending: true });

  // 기간 필터 (KST 기준으로 변환)
  if (startMonth) {
    const [y, m] = startMonth.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1) - KST_OFFSET).toISOString();
    query = query.gte("transaction_at", start);
  }
  if (endMonth) {
    const [y, m] = endMonth.split("-").map(Number);
    // endMonth의 다음 달 1일 = 해당 월의 마지막 순간
    const end = new Date(Date.UTC(y, m, 1) - KST_OFFSET).toISOString();
    query = query.lt("transaction_at", end);
  }

  const { data: transactions, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 카테고리, 자산 이름 조회
  const [{ data: categories }, { data: assets }] = await Promise.all([
    supabase.from("categories").select("id, name"),
    supabase.from("assets").select("id, name"),
  ]);

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const assetMap = new Map((assets ?? []).map((a) => [a.id, a.name]));

  // 엑셀 행 데이터 변환
  const rows = (transactions ?? []).map((t) => {
    const date = new Date(new Date(t.transaction_at).getTime() + KST_OFFSET);
    const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
    return {
      날짜: dateStr,
      유형: t.type === "income" ? "수입" : "지출",
      금액: t.amount,
      분류: categoryMap.get(t.category_id) ?? "-",
      자산: assetMap.get(t.asset_id) ?? "-",
      메모: t.description ?? "",
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // 컬럼 너비 설정
  ws["!cols"] = [
    { wch: 12 }, // 날짜
    { wch: 6 },  // 유형
    { wch: 12 }, // 금액
    { wch: 12 }, // 분류
    { wch: 12 }, // 자산
    { wch: 20 }, // 메모
  ];

  XLSX.utils.book_append_sheet(wb, ws, "거래내역");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const label = startMonth && endMonth
    ? `${startMonth}_${endMonth}`
    : startMonth
    ? `${startMonth}_이후`
    : endMonth
    ? `_${endMonth}까지`
    : "전체";
  const filename = `가계부_${label}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
