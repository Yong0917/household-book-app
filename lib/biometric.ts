// WebAuthn 기반 생체인증 유틸리티

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

const STORAGE_KEY = "biometric_credential";

interface StoredCredential {
  credentialId: string; // base64url 인코딩
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

/** 이 기기에서 생체인증(Face ID / 지문 등) 사용 가능 여부 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential) return false;
  return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

/** 이 기기에 등록된 생체인증이 있는지 확인 */
export function isBiometricRegistered(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(STORAGE_KEY);
}

/** 등록된 이메일 조회 (로그인 페이지 표시용) */
export function getBiometricEmail(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return (JSON.parse(stored) as StoredCredential).email;
  } catch {
    return null;
  }
}

/** 생체인증 등록 — 로그인 상태에서 설정 화면에서 호출 */
export async function registerBiometric(
  userId: string,
  email: string,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userIdBytes = new TextEncoder().encode(userId);

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "가계부", id: window.location.hostname },
      user: {
        id: userIdBytes,
        name: email,
        displayName: email,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },   // ES256
        { alg: -257, type: "public-key" }, // RS256 fallback
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // 기기 내장 인증기만 사용 (Face ID / 지문)
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("생체인증 등록에 실패했습니다");

  const stored: StoredCredential = {
    credentialId: bufferToBase64url(credential.rawId),
    userId,
    email,
    accessToken,
    refreshToken,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

/** 생체인증으로 로그인 — 저장된 토큰 반환 */
export async function authenticateWithBiometric(): Promise<{
  email: string;
  accessToken: string;
  refreshToken: string;
}> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error("등록된 생체인증이 없습니다");

  const stored: StoredCredential = JSON.parse(raw);
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [
        {
          id: base64urlToBuffer(stored.credentialId),
          type: "public-key",
        },
      ],
      userVerification: "required",
      timeout: 60000,
    },
  });

  if (!assertion) throw new Error("생체인증에 실패했습니다");

  return {
    email: stored.email,
    accessToken: stored.accessToken,
    refreshToken: stored.refreshToken,
  };
}

/** 로그인 성공 후 저장된 토큰 갱신 */
export function updateBiometricTokens(accessToken: string, refreshToken: string): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data: StoredCredential = JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, accessToken, refreshToken }));
  } catch {
    // 무시
  }
}

/** 생체인증 등록 해제 */
export function clearBiometric(): void {
  localStorage.removeItem(STORAGE_KEY);
}
