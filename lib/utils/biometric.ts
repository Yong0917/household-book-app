// Android WebView 생체인증 로그인 브리지 래퍼.
// 세션 만료 시 저장된 Supabase refresh token을 생체인증으로 잠금해제해 재로그인한다.
// 웹 브라우저(비 Android)에서는 모든 함수가 안전하게 no-op / false / null 을 반환한다.

type AndroidBridge = {
  getPlatform?: () => string;
  isBiometricAvailable?: () => boolean;
  isBiometricLoginEnabled?: () => boolean;
  enableBiometricLogin?: (refresh: string, access: string) => void;
  updateBiometricTokens?: (refresh: string, access: string) => void;
  biometricLogin?: () => void;
  clearBiometricLogin?: () => void;
};

type BiometricWindow = Window & {
  __MONEYLOGS_ANDROID_APP__?: boolean;
  AndroidBridge?: AndroidBridge;
  __onBiometricEnableResult?: (success: boolean) => void;
  __onBiometricLoginResult?: (refresh: string, access: string) => void;
};

export type BiometricTokens = { refreshToken: string; accessToken: string };

function getBridge(): AndroidBridge | null {
  if (typeof window === "undefined") return null;
  return (window as BiometricWindow).AndroidBridge ?? null;
}

// 플랫폼 감지 — AndroidBridge.getPlatform() 우선.
// 전역 플래그(__MONEYLOGS_ANDROID_APP__)는 onPageFinished에서 주입되어 초기 렌더 시
// 아직 없을 수 있으나, AndroidBridge는 onCreate의 addJavascriptInterface로 항상 존재한다.
export function isAndroidApp(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as BiometricWindow;
  try {
    if (w.AndroidBridge?.getPlatform?.() === "android") return true;
  } catch {
    // 브리지 호출 실패 시 아래 폴백으로
  }
  if (w.__MONEYLOGS_ANDROID_APP__ === true) return true;
  if (window.localStorage?.getItem("moneylogs:platform") === "android") return true;
  return navigator.userAgent.includes("MoneyLogsApp/Android");
}

export function isBiometricAvailable(): boolean {
  try {
    return getBridge()?.isBiometricAvailable?.() === true;
  } catch {
    return false;
  }
}

export function isBiometricLoginEnabled(): boolean {
  try {
    return getBridge()?.isBiometricLoginEnabled?.() === true;
  } catch {
    return false;
  }
}

// 생체 프롬프트(등록/로그인)는 한 번에 하나만 진행하도록 가드한다.
const CALLBACK_TIMEOUT_MS = 60_000;
let inFlight = false;

// 등록: 생체 프롬프트 → 성공 여부. 브리지 없거나 다른 프롬프트 진행 중이면 false.
export function enableBiometricLogin(refresh: string, access: string): Promise<boolean> {
  const bridge = getBridge();
  if (!bridge?.enableBiometricLogin || inFlight) return Promise.resolve(false);
  const w = window as BiometricWindow;
  inFlight = true;
  return new Promise<boolean>((resolve) => {
    let done = false;
    const finish = (result: boolean) => {
      if (done) return;
      done = true;
      inFlight = false;
      clearTimeout(timer);
      delete w.__onBiometricEnableResult;
      resolve(result);
    };
    const timer = setTimeout(() => finish(false), CALLBACK_TIMEOUT_MS);
    w.__onBiometricEnableResult = (success: boolean) => finish(success === true);
    try {
      bridge.enableBiometricLogin!(refresh, access);
    } catch {
      finish(false);
    }
  });
}

// 로그인: 생체 프롬프트 → 저장 토큰. 실패/취소/토큰없음이면 null.
export function biometricLogin(): Promise<BiometricTokens | null> {
  const bridge = getBridge();
  if (!bridge?.biometricLogin || inFlight) return Promise.resolve(null);
  const w = window as BiometricWindow;
  inFlight = true;
  return new Promise<BiometricTokens | null>((resolve) => {
    let done = false;
    const finish = (value: BiometricTokens | null) => {
      if (done) return;
      done = true;
      inFlight = false;
      clearTimeout(timer);
      delete w.__onBiometricLoginResult;
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), CALLBACK_TIMEOUT_MS);
    w.__onBiometricLoginResult = (refresh: string, access: string) => {
      finish(refresh ? { refreshToken: refresh, accessToken: access } : null);
    };
    try {
      bridge.biometricLogin!();
    } catch {
      finish(null);
    }
  });
}

// rotation 동기화: 이미 등록된 경우에만 네이티브가 저장 토큰을 갱신 (no-op safe).
export function updateBiometricTokens(refresh: string, access: string): void {
  try {
    getBridge()?.updateBiometricTokens?.(refresh, access);
  } catch {
    // no-op
  }
}

export function clearBiometricLogin(): void {
  try {
    getBridge()?.clearBiometricLogin?.();
  } catch {
    // no-op
  }
}
