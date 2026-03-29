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
    <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
          <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <span className="text-[14.5px] font-medium">고정비 알림</span>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
          enabled ? "bg-indigo-500" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
