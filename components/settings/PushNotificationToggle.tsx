"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { saveDeviceToken, removeDeviceToken } from "@/lib/actions/notifications";

const PREF_KEY = "moneylogs:notifications";

type AndroidWindow = Window & {
  __MONEYLOGS_ANDROID_APP__?: boolean;
  AndroidBridge?: { getFcmToken?: () => string };
};

export function PushNotificationToggle() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const w = window as AndroidWindow;
    if (!w.__MONEYLOGS_ANDROID_APP__) return;

    const fcmToken = w.AndroidBridge?.getFcmToken?.() ?? "";
    if (!fcmToken) return;

    setIsAndroid(true);
    setToken(fcmToken);

    const pref = localStorage.getItem(PREF_KEY);
    setEnabled(pref !== "disabled");
  }, []);

  if (!isAndroid) return null;

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setLoading(true);
    localStorage.setItem(PREF_KEY, next ? "enabled" : "disabled");

    try {
      if (next) {
        await saveDeviceToken(token);
      } else {
        await removeDeviceToken(token);
      }
    } catch (e) {
      console.error("[PushNotificationToggle]", e);
      // 실패 시 원래 상태로 복구
      setEnabled(!next);
      localStorage.setItem(PREF_KEY, !next ? "enabled" : "disabled");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-t border-border/50">
      {/* 아이콘 + 텍스트 영역 */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <Bell className="h-[18px] w-[18px] text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[14.5px] font-medium leading-tight">고정비 알림</span>
          {/* 알림 종류 부제목 */}
          <span className="text-[12px] text-muted-foreground/60 leading-tight">
            결제일·월말 미처리 알림
          </span>
        </div>
      </div>
      {/* 토글 스위치 */}
      <button
        role="switch"
        aria-checked={enabled}
        aria-label="고정비 알림 켜기/끄기"
        onClick={handleToggle}
        disabled={loading}
        className={[
          "relative inline-flex h-[30px] w-[52px] shrink-0 items-center rounded-full",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          enabled ? "bg-indigo-500" : "bg-muted-foreground/25",
        ].join(" ")}
      >
        {/* 토글 핸들 */}
        <span
          className={[
            "inline-block h-[22px] w-[22px] rounded-full bg-white",
            "shadow-[0_1px_4px_rgba(0,0,0,0.18)]",
            "transition-transform duration-200",
            enabled ? "translate-x-[26px]" : "translate-x-[4px]",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
