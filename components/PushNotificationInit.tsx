"use client";

import { useEffect } from "react";
import { saveDeviceToken } from "@/lib/actions/notifications";
import { scheduleIdle } from "@/lib/utils/idle";

// 마지막으로 저장한 "userId:token"과 시각 — 같은 토큰을 앱 실행마다 재저장하지 않기 위함
const SAVED_KEY = "moneylogs:fcm-token-saved";
// 서버에서 토큰 행이 정리됐을 경우를 대비해 주기적으로는 재저장
const RESAVE_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

// Android WebView에서 AndroidBridge.getFcmToken()으로 FCM 토큰을 받아 DB에 저장
// protected layout에 마운트 — 로그인된 사용자에게만 실행됨
export default function PushNotificationInit({ userId }: { userId: string }) {
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

    const marker = `${userId}:${token}`;
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "null") as { marker: string; at: number } | null;
      if (saved?.marker === marker && Date.now() - saved.at < RESAVE_INTERVAL_MS) return;
    } catch {
      // 손상된 값은 무시하고 재저장
    }

    // 첫 화면 데이터 요청과 경쟁하지 않도록 유휴 시점에 저장
    return scheduleIdle(() => {
      saveDeviceToken(token)
        .then(() => localStorage.setItem(SAVED_KEY, JSON.stringify({ marker, at: Date.now() })))
        .catch((e) => console.error("[PushNotificationInit]", e));
    });
  }, [userId]);

  return null;
}
