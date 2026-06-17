import {
  isAndroidApp,
  isBiometricAvailable,
  isBiometricLoginEnabled,
  enableBiometricLogin,
  biometricLogin,
  updateBiometricTokens,
  clearBiometricLogin,
} from "@/lib/utils/biometric";

type TestWindow = typeof window & {
  __MONEYLOGS_ANDROID_APP__?: boolean;
  AndroidBridge?: Record<string, unknown>;
  __onBiometricEnableResult?: (s: boolean) => void;
  __onBiometricLoginResult?: (r: string, a: string) => void;
};

const w = window as TestWindow;

afterEach(() => {
  delete w.AndroidBridge;
  delete w.__MONEYLOGS_ANDROID_APP__;
  delete w.__onBiometricEnableResult;
  delete w.__onBiometricLoginResult;
  window.localStorage.clear();
});

describe("isAndroidApp", () => {
  it("AndroidBridge.getPlatform()가 android면 true (전역 플래그 없어도)", () => {
    w.AndroidBridge = { getPlatform: () => "android" };
    expect(isAndroidApp()).toBe(true);
  });

  it("브리지·플래그가 전혀 없으면 false", () => {
    expect(isAndroidApp()).toBe(false);
  });

  it("localStorage 플래그로도 감지", () => {
    window.localStorage.setItem("moneylogs:platform", "android");
    expect(isAndroidApp()).toBe(true);
  });
});

describe("isBiometricAvailable / isBiometricLoginEnabled", () => {
  it("브리지 반환값을 그대로 반영", () => {
    w.AndroidBridge = {
      isBiometricAvailable: () => true,
      isBiometricLoginEnabled: () => false,
    };
    expect(isBiometricAvailable()).toBe(true);
    expect(isBiometricLoginEnabled()).toBe(false);
  });

  it("브리지 없으면 false (웹 브라우저)", () => {
    expect(isBiometricAvailable()).toBe(false);
    expect(isBiometricLoginEnabled()).toBe(false);
  });
});

describe("enableBiometricLogin", () => {
  it("네이티브가 true 콜백하면 resolve(true)", async () => {
    w.AndroidBridge = {
      enableBiometricLogin: () => w.__onBiometricEnableResult?.(true),
    };
    await expect(enableBiometricLogin("r", "a")).resolves.toBe(true);
  });

  it("네이티브가 false 콜백하면 resolve(false)", async () => {
    w.AndroidBridge = {
      enableBiometricLogin: () => w.__onBiometricEnableResult?.(false),
    };
    await expect(enableBiometricLogin("r", "a")).resolves.toBe(false);
  });

  it("브리지 없으면 false", async () => {
    await expect(enableBiometricLogin("r", "a")).resolves.toBe(false);
  });
});

describe("biometricLogin", () => {
  it("refresh 토큰 콜백 시 토큰 객체 반환", async () => {
    w.AndroidBridge = {
      biometricLogin: () => w.__onBiometricLoginResult?.("rtok", "atok"),
    };
    await expect(biometricLogin()).resolves.toEqual({
      refreshToken: "rtok",
      accessToken: "atok",
    });
  });

  it("빈 refresh 콜백(실패/취소)이면 null", async () => {
    w.AndroidBridge = {
      biometricLogin: () => w.__onBiometricLoginResult?.("", ""),
    };
    await expect(biometricLogin()).resolves.toBeNull();
  });

  it("브리지 없으면 null", async () => {
    await expect(biometricLogin()).resolves.toBeNull();
  });
});

describe("updateBiometricTokens / clearBiometricLogin", () => {
  it("브리지 메서드를 호출한다", () => {
    const update = jest.fn();
    const clear = jest.fn();
    w.AndroidBridge = { updateBiometricTokens: update, clearBiometricLogin: clear };
    updateBiometricTokens("r", "a");
    clearBiometricLogin();
    expect(update).toHaveBeenCalledWith("r", "a");
    expect(clear).toHaveBeenCalled();
  });

  it("브리지 없어도 throw 하지 않는다", () => {
    expect(() => updateBiometricTokens("r", "a")).not.toThrow();
    expect(() => clearBiometricLogin()).not.toThrow();
  });
});
