import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const KST_OFFSET = 9 * 60 * 60 * 1000;

interface ColMap {
  date: string;
  time: string;
  type: string;
  amount: string;
  category: string;
  asset: string;
  memo: string;
  incomeVal: string;
  expenseVal: string;
}

// 날짜 파싱: 여러 포맷 지원
function parseDate(val: unknown): string | null {
  if (val === null || val === undefined || val === "") return null;

  // 엑셀 시리얼 숫자 (1900-01-01 기준)
  if (typeof val === "number") {
    const MS_PER_DAY = 86400 * 1000;
    const EXCEL_EPOCH = new Date(1899, 11, 30).getTime(); // 1899-12-30
    const d = new Date(EXCEL_EPOCH + val * MS_PER_DAY);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
  }

  const str = String(val).trim();

  // YYYY-MM-DD / YYYY/MM/DD / YYYY.MM.DD
  const m1 = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m1) {
    return `${m1[1]}-${m1[2].padStart(2, "0")}-${m1[3].padStart(2, "0")}`;
  }

  // MM/DD/YYYY
  const m2 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m2) {
    return `${m2[3]}-${m2[1].padStart(2, "0")}-${m2[2].padStart(2, "0")}`;
  }

  // 네이티브 Date 파싱 (마지막 수단)
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }

  return null;
}

// 시간 파싱
function parseTime(val: unknown): string {
  if (!val && val !== 0) return "00:00";

  // 엑셀 시간 (0~1 분수)
  if (typeof val === "number" && val >= 0 && val < 1) {
    const totalSecs = Math.round(val * 86400);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const str = String(val).trim();
  const m = str.match(/^(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;

  return "00:00";
}

// 금액 파싱: 음수·콤마·통화기호 제거 후 양수로
function parseAmount(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "number") return val !== 0 ? Math.abs(Math.round(val)) : null;

  const str = String(val)
    .replace(/[,\s원₩$]/g, "")
    .replace(/^[+\-]/, "");
  const n = parseFloat(str);
  return isNaN(n) || n <= 0 ? null : Math.abs(Math.round(n));
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { rows, mapping }: { rows: Record<string, unknown>[]; mapping: ColMap } =
    await request.json();

  if (!rows?.length || !mapping) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  // 사용자 카테고리·자산 로드
  const [{ data: categories }, { data: assets }] = await Promise.all([
    supabase.from("categories").select("id, name").eq("user_id", user.id),
    supabase.from("assets").select("id, name").eq("user_id", user.id),
  ]);

  const catByName = new Map((categories ?? []).map((c) => [c.name, c.id]));
  const assetByName = new Map((assets ?? []).map((a) => [a.name, a.id]));
  const defaultCatId = (categories ?? [])[0]?.id ?? null;
  const defaultAssetId = (assets ?? [])[0]?.id ?? null;

  if (!defaultCatId || !defaultAssetId) {
    return NextResponse.json(
      { error: "분류 또는 자산을 먼저 등록해주세요" },
      { status: 400 }
    );
  }

  let skipped = 0;
  let categoryFallbacks = 0;
  let assetFallbacks = 0;
  const toInsert: object[] = [];

  for (const row of rows) {
    // 날짜
    const dateStr = parseDate(row[mapping.date]);
    if (!dateStr) { skipped++; continue; }

    // 금액
    const amount = parseAmount(row[mapping.amount]);
    if (!amount) { skipped++; continue; }

    // 유형
    const typeRaw = String(row[mapping.type] ?? "").trim();
    let type: "income" | "expense";
    if (typeRaw === mapping.incomeVal) type = "income";
    else if (typeRaw === mapping.expenseVal) type = "expense";
    else { skipped++; continue; }

    // 시간 → transaction_at (KST → UTC)
    const timeStr = mapping.time ? parseTime(row[mapping.time]) : "00:00";
    const [hh, mm] = timeStr.split(":").map(Number);
    const [y, mo, d] = dateStr.split("-").map(Number);
    const transactionAt = new Date(
      Date.UTC(y, mo - 1, d, hh, mm) - KST_OFFSET
    ).toISOString();

    // 분류 매핑
    let categoryId = defaultCatId;
    if (mapping.category) {
      const name = String(row[mapping.category] ?? "").trim();
      const found = catByName.get(name);
      if (found) {
        categoryId = found;
      } else {
        categoryFallbacks++;
      }
    }

    // 자산 매핑
    let assetId = defaultAssetId;
    if (mapping.asset) {
      const name = String(row[mapping.asset] ?? "").trim();
      const found = assetByName.get(name);
      if (found) {
        assetId = found;
      } else {
        assetFallbacks++;
      }
    }

    // 메모
    const description = mapping.memo
      ? (String(row[mapping.memo] ?? "").trim() || null)
      : null;

    toInsert.push({
      user_id: user.id,
      type,
      amount,
      category_id: categoryId,
      asset_id: assetId,
      description,
      transaction_at: transactionAt,
    });
  }

  // 500건씩 배치 삽입
  const BATCH_SIZE = 500;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("transactions").insert(batch);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: toInsert.length,
    skipped,
    categoryFallbacks,
    assetFallbacks,
  });
}
