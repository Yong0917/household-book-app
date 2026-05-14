import { cn } from "../../utils";

describe("cn", () => {
  it("여러 문자열을 공백으로 연결해야 한다", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("falsy 값(false, null, undefined, 빈 문자열)을 제거해야 한다", () => {
    expect(cn("a", false, null, undefined, "")).toBe("a");
  });

  it("조건부 객체에서 true 인 키만 포함해야 한다", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("tailwind 충돌 클래스는 뒤쪽이 이긴다 (twMerge)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("배열 입력도 평탄화하여 결합해야 한다", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("인자가 없으면 빈 문자열을 반환해야 한다", () => {
    expect(cn()).toBe("");
  });
});
