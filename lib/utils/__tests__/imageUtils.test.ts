import { extractStoragePath } from "../imageUtils";

describe("extractStoragePath", () => {
  it("Supabase Storage URL에서 버킷 내 경로를 추출해야 한다", () => {
    const url =
      "https://x.supabase.co/storage/v1/object/public/receipts/uid/abc.webp";
    expect(extractStoragePath(url, "receipts")).toBe("uid/abc.webp");
  });

  it("버킷이 URL에 포함되지 않으면 빈 문자열을 반환해야 한다", () => {
    const url = "https://x.com/other/foo.png";
    expect(extractStoragePath(url, "receipts")).toBe("");
  });

  it("버킷명이 두 번 등장하면 첫 매치 이후를 반환해야 한다", () => {
    const url =
      "https://x.supabase.co/storage/v1/object/public/receipts/sub/receipts/file.webp";
    expect(extractStoragePath(url, "receipts")).toBe("sub/receipts/file.webp");
  });

  it("쿼리스트링이 있으면 그대로 보존되어야 한다", () => {
    const url =
      "https://x.supabase.co/storage/v1/object/public/receipts/uid/abc.webp?token=xyz";
    expect(extractStoragePath(url, "receipts")).toBe("uid/abc.webp?token=xyz");
  });

  it("빈 문자열을 입력하면 빈 문자열을 반환해야 한다", () => {
    expect(extractStoragePath("", "receipts")).toBe("");
  });
});
