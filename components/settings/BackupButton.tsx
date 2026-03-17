"use client";

import { useState } from "react";
import { HardDrive } from "lucide-react";

export function BackupButton() {
  const [loading, setLoading] = useState(false);

  async function handleBackup() {
    setLoading(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("백업 실패");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename\*=UTF-8''(.+)/);
      a.download = match ? decodeURIComponent(match[1]) : "가계부_백업.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("백업 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBackup}
      disabled={loading}
      className="flex w-full items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors disabled:opacity-60"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
          <HardDrive className="h-4 w-4 text-foreground/70" />
        </div>
        <span className="text-[14.5px] font-medium">
          {loading ? "백업 중..." : "전체 데이터 백업"}
        </span>
      </div>
    </button>
  );
}
