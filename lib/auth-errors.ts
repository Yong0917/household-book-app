// Supabase 인증 에러 메시지 한국어 번역
const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "Invalid credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "User already registered": "이미 가입된 이메일입니다.",
  "Email not confirmed": "이메일 인증이 완료되지 않았습니다. 이메일함을 확인해 주세요.",
  "Password should be at least 6 characters": "비밀번호는 최소 6자 이상이어야 합니다.",
  "New password should be different from the old password": "새 비밀번호는 기존 비밀번호와 달라야 합니다.",
  "For security purposes, you can only request this once every 60 seconds": "보안을 위해 60초에 한 번만 요청할 수 있습니다.",
  "Email rate limit exceeded": "이메일 전송 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.",
  "Unable to validate email address: invalid format": "올바른 이메일 형식이 아닙니다.",
  "Token has expired or is invalid": "링크가 만료되었거나 유효하지 않습니다. 다시 시도해 주세요.",
  "Signup requires a valid password": "유효한 비밀번호를 입력해 주세요.",
  "An error occurred": "오류가 발생했습니다. 다시 시도해 주세요.",
};

export function translateAuthError(error: unknown): string {
  if (!(error instanceof Error)) return "오류가 발생했습니다. 다시 시도해 주세요.";
  const msg = error.message;
  // 정확히 일치하는 항목 먼저 확인
  if (ERROR_MAP[msg]) return ERROR_MAP[msg];
  // 부분 일치 확인
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return value;
  }
  return "오류가 발생했습니다. 다시 시도해 주세요.";
}
