import { matchMemos, normalizeMemo, type MemoRule } from "@/lib/utils/memoMatch";

const MEMOS = ["회비", "6개월 회비", "월 회비", "회 비!", "스타벅스 강남점", "점심"];

describe("normalizeMemo", () => {
  it("공백·기호를 제거하고 글자/숫자만 남긴다", () => {
    expect(normalizeMemo("회 비!")).toBe("회비");
    expect(normalizeMemo("6개월 회비")).toBe("6개월회비");
    expect(normalizeMemo("a-b_c d")).toBe("abcd");
  });
});

describe("matchMemos - contains", () => {
  it("특정 단어를 포함하는 메모를 모두 찾는다", () => {
    const rule: MemoRule = { kind: "contains", query: "회비" };
    const { matched, regexError } = matchMemos(MEMOS, rule);
    expect(regexError).toBe(false);
    expect(matched).toEqual(["회비", "6개월 회비", "월 회비"]);
  });
});

describe("matchMemos - startsWith / endsWith", () => {
  it("startsWith 는 접두 일치만", () => {
    const { matched } = matchMemos(MEMOS, { kind: "startsWith", query: "스타벅스" });
    expect(matched).toEqual(["스타벅스 강남점"]);
  });

  it("endsWith 는 접미 일치만", () => {
    const { matched } = matchMemos(MEMOS, { kind: "endsWith", query: "회비" });
    expect(matched).toEqual(["회비", "6개월 회비", "월 회비"]);
  });
});

describe("matchMemos - 공백·기호 무시", () => {
  it("ignoreSpaceSymbols 로 '회 비!' 도 '회비' 와 같게 취급", () => {
    const { matched } = matchMemos(MEMOS, {
      kind: "contains",
      query: "회비",
      ignoreSpaceSymbols: true,
    });
    expect(matched).toEqual(["회비", "6개월 회비", "월 회비", "회 비!"]);
  });
});

describe("matchMemos - regex", () => {
  it("정규식으로 복잡한 패턴을 매칭한다", () => {
    const { matched, regexError } = matchMemos(MEMOS, {
      kind: "regex",
      query: "^\\d+개월",
    });
    expect(regexError).toBe(false);
    expect(matched).toEqual(["6개월 회비"]);
  });

  it("잘못된 정규식은 regexError=true, 빈 결과", () => {
    const { matched, regexError } = matchMemos(MEMOS, { kind: "regex", query: "[" });
    expect(regexError).toBe(true);
    expect(matched).toEqual([]);
  });
});

describe("matchMemos - 빈 쿼리", () => {
  it("빈 문자열/공백만 있으면 매칭 없음", () => {
    expect(matchMemos(MEMOS, { kind: "contains", query: "" }).matched).toEqual([]);
    expect(matchMemos(MEMOS, { kind: "contains", query: "   " }).matched).toEqual([]);
  });
});
