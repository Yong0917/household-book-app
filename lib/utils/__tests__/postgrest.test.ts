import { orIlikePattern } from "../postgrest";

describe("orIlikePattern", () => {
  it("일반 검색어를 큰따옴표로 감싼 ilike 패턴으로 만든다", () => {
    expect(orIlikePattern("커피")).toBe('"%커피%"');
  });

  it("쉼표가 포함된 검색어도 따옴표 안에 안전하게 담는다", () => {
    // .or() 필터에서 쉼표가 조건 구분자로 오인되지 않아야 한다
    expect(orIlikePattern("커피, 라떼")).toBe('"%커피, 라떼%"');
  });

  it("괄호가 포함된 검색어를 그대로 담는다", () => {
    expect(orIlikePattern("결제(카드)")).toBe('"%결제(카드)%"');
  });

  it("큰따옴표는 백슬래시로 이스케이프한다", () => {
    expect(orIlikePattern('say "hi"')).toBe('"%say \\"hi\\"%"');
  });

  it("백슬래시는 백슬래시로 이스케이프한다", () => {
    expect(orIlikePattern("a\\b")).toBe('"%a\\\\b%"');
  });

  it("% 와일드카드는 보존한다", () => {
    expect(orIlikePattern("50%")).toBe('"%50%%"');
  });
});
