"use client";

import { useEffect } from "react";
import { saveDeviceToken } from "@/lib/actions/notifications";

// Android WebView에서 AndroidBridge.getFcmToken()으로 FCM 토큰을 받아 DB에 저장
// protected layout에 마운트 — 로그인된 사용자에게만 실행됨
export default function PushNotificationInit() {
  useEffect(() => {
    // Android WebView 환경이 아니면 실행 안 함
    if (typeof window === "undefined") return;

    type AndroidWindow = Window & {
      __MONEYLOGS_ANDROID_APP__?: boolean;
      AndroidBridge?: { getFcmToken?: () => string };
    };
    const w = window as AndroidWindow;

    if (!w.__MONEYLOGS_ANDROID_APP__) return;

    const bridge = w.AndroidBridge;

    if (!bridge?.getFcmToken) return;

    const token = bridge.getFcmToken();
    if (!token) return;

    // 사용자가 알림을 껐으면 토큰 저장 안 함
    const pref = localStorage.getItem("moneylogs:notifications");
    if (pref === "disabled") return;

    saveDeviceToken(token).catch((e) =>
      console.error("[PushNotificationInit]", e)
    );
  }, []);

  return null;
}
