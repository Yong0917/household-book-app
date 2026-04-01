import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ReceiptAnalysisResult {
  amount?: number;
  description?: string;
  date?: string; // yyyy-MM-dd
  type?: "income" | "expense";
}

export async function POST(request: NextRequest) {
  // 접근 권한 체크
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const userId = authData.claims.sub as string;
  const isAdmin = userId === process.env.ADMIN_USER_ID;

  if (!isAdmin) {
    const adminClient = createAdminClient();
    const { data: access } = await adminClient
      .from("receipt_scan_access")
      .select("status")
      .eq("user_id", userId)
      .single();

    if (!access || access.status !== "approved") {
      return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
    }
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  let imageBase64: string;
  let mimeType: string;

  try {
    const body = await request.json();
    imageBase64 = body.imageBase64;
    mimeType = body.mimeType ?? "image/jpeg";
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!imageBase64) {
    return NextResponse.json({ error: "이미지 데이터가 없습니다." }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `이 이미지는 영수증 또는 결제 캡처본입니다. 다음 정보를 추출해서 JSON으로만 응답해주세요. 다른 텍스트는 절대 포함하지 마세요.

추출할 필드:
- amount: 결제 금액 (숫자만, 원화 기준). 총 결제금액 또는 합계 금액 기준. 없으면 null.
- description: 상호명 또는 가맹점명 (한국어 그대로). 없으면 null.
- date: 결제 날짜 (yyyy-MM-dd 형식). 없으면 null.
- type: "expense" (결제/구매) 또는 "income" (환불/입금). 영수증이면 보통 "expense".

응답 형식 예시:
{"amount":15000,"description":"스타벅스","date":"2024-03-15","type":"expense"}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
        { text: prompt },
      ],
    });

    const text = response.text?.trim() ?? "";

    // JSON 파싱 (```json ... ``` 래핑 대응)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "인식 결과를 파싱할 수 없습니다." }, { status: 422 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as ReceiptAnalysisResult;

    // amount 유효성 검사
    if (parsed.amount !== null && parsed.amount !== undefined) {
      parsed.amount = Math.abs(Math.round(Number(parsed.amount)));
      if (isNaN(parsed.amount) || parsed.amount <= 0) parsed.amount = undefined;
    }

    // date 형식 검사
    if (parsed.date && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.date)) {
      parsed.date = undefined;
    }

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("[analyze-receipt] Gemini 호출 실패:", e);

    // 429: 무료 티어 요청 한도 초과
    const status = (e as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json(
        { error: "잠시 후 다시 시도해주세요. (무료 요청 한도 초과)" },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: "영수증 분석에 실패했습니다." }, { status: 500 });
  }
}
