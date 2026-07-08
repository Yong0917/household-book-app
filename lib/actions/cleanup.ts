"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export interface MemoCount {
  description: string;
  count: number;
}

// 카테고리별 고유 메모 + 건수 (빈 문자열/NULL 제외, 건수 내림차순)
export async function getCategoryMemoCounts(categoryId: string): Promise<MemoCount[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다");

  const { data, error } = await supabase.rpc("get_category_memo_counts", {
    p_category_id: categoryId,
  });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: { description: string; cnt: number }) => ({
    description: row.description,
    count: Number(row.cnt),
  }));
}

// 특정 카테고리에서 지정한 메모들을 새 메모로 일괄 변경 (단일 UPDATE)
export async function bulkRenameMemos(
  categoryId: string,
  oldDescriptions: string[],
  newDescription: string
): Promise<{ updated: number }> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다");
  const userId = authData.claims.sub as string;

  const trimmed = newDescription.trim();
  if (trimmed === "") throw new Error("바꿀 메모를 입력하세요");
  if (oldDescriptions.length === 0) return { updated: 0 };

  const { data, error } = await supabase
    .from("transactions")
    .update({ description: trimmed })
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .in("description", oldDescriptions)
    .select("id");

  if (error) throw new Error(error.message);
  return { updated: data?.length ?? 0 };
}

export interface MemoGroup {
  canonical: string;
  members: string[];
}

// AI 그룹핑 (관리자 전용) — 유사 메모를 묶고 대표 메모를 제안
export async function suggestMemoGroups(
  categoryName: string,
  memos: string[]
): Promise<MemoGroup[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다");
  const userId = authData.claims.sub as string;

  if (userId !== process.env.ADMIN_USER_ID) {
    throw new Error("AI 정리는 관리자만 사용할 수 있습니다");
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("AI 기능이 설정되지 않았습니다");

  if (memos.length === 0) return [];

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `다음은 가계부의 '${categoryName}' 카테고리에 입력된 메모 목록입니다. 의미가 같거나 사실상 동일한 대상을 가리키는 메모끼리 묶고, 각 그룹의 대표 메모를 하나 정하세요. 대표 메모는 가장 간결하고 대표성 있는 표현으로 고릅니다. 묶을 게 없는 단독 메모는 그룹으로 만들지 마세요.

규칙:
- members 에는 반드시 아래 목록에 있는 메모를 그대로(원문) 넣습니다.
- 각 메모는 최대 한 그룹에만 넣습니다.
- 다른 텍스트 없이 JSON 배열로만 응답합니다.

응답 형식 예시:
[{"canonical":"회비","members":["회비","6개월 회비","월 회비"]}]

메모 목록:
${memos.map((m) => `- ${m}`).join("\n")}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: prompt }],
  });

  const text = response.text?.trim() ?? "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  // 목록에 실제로 존재하는 메모만 남기고, 한 메모는 한 그룹에만 배정
  const memoSet = new Set(memos);
  const used = new Set<string>();
  const groups: MemoGroup[] = [];

  for (const g of parsed) {
    if (!g || typeof g !== "object") continue;
    const canonical = typeof (g as MemoGroup).canonical === "string" ? (g as MemoGroup).canonical.trim() : "";
    const rawMembers = Array.isArray((g as MemoGroup).members) ? (g as MemoGroup).members : [];

    const members = rawMembers.filter(
      (m): m is string => typeof m === "string" && memoSet.has(m) && !used.has(m)
    );
    if (members.length < 2 || canonical === "") continue;

    members.forEach((m) => used.add(m));
    groups.push({ canonical, members });
  }

  return groups;
}
