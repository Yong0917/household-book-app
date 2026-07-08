// 가계부 정리 도구용 메모 규칙 매칭 (순수 함수)
// 작은 "고유 메모 목록"에 규칙을 적용해 매칭된 메모만 반환한다.

export type MemoRuleKind = "contains" | "startsWith" | "endsWith" | "regex";

export interface MemoRule {
  kind: MemoRuleKind;
  query: string;
  // 공백·기호를 무시하고 비교 (contains/startsWith/endsWith 에만 적용)
  ignoreSpaceSymbols?: boolean;
}

// 공백·기호 제거 (한글/영문/숫자만 남김)
export function normalizeMemo(s: string): string {
  return s.replace(/[^\p{L}\p{N}]/gu, "");
}

export interface MatchResult {
  matched: string[];
  // 정규식이 잘못된 경우 true (매칭은 빈 배열)
  regexError: boolean;
}

// 규칙에 맞는 메모 목록을 반환. 원본 문자열을 그대로 돌려준다.
export function matchMemos(memos: string[], rule: MemoRule): MatchResult {
  const query = rule.query;
  if (query.trim() === "") {
    return { matched: [], regexError: false };
  }

  if (rule.kind === "regex") {
    let re: RegExp;
    try {
      re = new RegExp(query);
    } catch {
      return { matched: [], regexError: true };
    }
    return { matched: memos.filter((m) => re.test(m)), regexError: false };
  }

  const useNorm = rule.ignoreSpaceSymbols === true;
  const q = useNorm ? normalizeMemo(query) : query;
  if (q === "") {
    return { matched: [], regexError: false };
  }

  const matched = memos.filter((m) => {
    const target = useNorm ? normalizeMemo(m) : m;
    switch (rule.kind) {
      case "contains":
        return target.includes(q);
      case "startsWith":
        return target.startsWith(q);
      case "endsWith":
        return target.endsWith(q);
    }
  });

  return { matched, regexError: false };
}
