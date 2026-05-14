import { translateAuthError } from "../auth-errors";

const DEFAULT_MSG = "오류가 발생했습니다. 다시 시도해 주세요.";

describe("translateAuthError", () => {
  it("정확히 일치하는 영어 메시지를 한국어로 번역해야 한다", () => {
    expect(translateAuthError(new Error("Invalid login credentials"))).toBe(
      "이메일 또는 비밀번호가 올바르지 않습니다."
    );
    expect(translateAuthError(new Error("User already registered"))).toBe(
      "이미 가입된 이메일입니다."
    );
  });

  it("부분 일치하는 메시지도 매핑된 한국어를 반환해야 한다", () => {
    // Supabase 가 던지는 실제 메시지는 prefix 가 붙는 경우가 많음
    expect(
      translateAuthError(new Error("AuthApiError: Invalid login credentials"))
    ).toBe("이메일 또는 비밀번호가 올바르지 않습니다.");
  });

  it("매핑되지 않은 Error 메시지는 기본 메시지를 반환해야 한다", () => {
    expect(translateAuthError(new Error("Some unknown failure"))).toBe(
      DEFAULT_MSG
    );
  });

  it("Error 인스턴스가 아니면 기본 메시지를 반환해야 한다", () => {
    expect(translateAuthError("just a string")).toBe(DEFAULT_MSG);
    expect(translateAuthError(null)).toBe(DEFAULT_MSG);
    expect(translateAuthError(undefined)).toBe(DEFAULT_MSG);
    expect(translateAuthError({ message: "Invalid login credentials" })).toBe(
      DEFAULT_MSG
    );
  });

  it("Password 규칙 메시지를 한국어로 변환해야 한다", () => {
    expect(
      translateAuthError(
        new Error("Password should be at least 6 characters")
      )
    ).toBe("비밀번호는 최소 6자 이상이어야 합니다.");
  });

  it("Rate limit 메시지를 한국어로 변환해야 한다", () => {
    expect(
      translateAuthError(
        new Error(
          "For security purposes, you can only request this once every 60 seconds"
        )
      )
    ).toBe("보안을 위해 60초에 한 번만 요청할 수 있습니다.");
  });
});
