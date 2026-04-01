"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Images, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReceiptScanModalProps {
  open: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}

export function ReceiptScanModal({ open, onClose, onCamera, onGallery }: ReceiptScanModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  // 백드롭 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="영수증 스캔 방법 선택"
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center px-8",
        "transition-opacity duration-200 ease-out",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={onClose} />

      {/* 모달 카드 */}
      <div
        className={cn(
          "relative w-full max-w-[312px] bg-background rounded-[22px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.35)] overflow-hidden",
          "transition-all duration-220 ease-out",
          visible ? "scale-100 translate-y-0" : "scale-[0.94] translate-y-3"
        )}
      >
        {/* 헤더 */}
        <div className="flex flex-col items-center pt-6 pb-5 px-5">
          <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center mb-3 shadow-sm">
            <ScanLine className="w-[18px] h-[18px] text-foreground/70" strokeWidth={1.75} />
          </div>
          <h3 className="text-[15.5px] font-semibold tracking-[-0.3px] text-foreground">
            영수증 스캔
          </h3>
          <p className="text-[12px] text-muted-foreground mt-1 text-center leading-snug">
            이미지를 불러올 방법을 선택해 주세요
          </p>
        </div>

        {/* 구분선 */}
        <div className="h-px bg-border/60 mx-0" />

        {/* 옵션 버튼들 */}
        <div className="p-2.5 flex flex-col gap-1.5">
          {/* 카메라 */}
          <button
            type="button"
            onClick={() => {
              onCamera();
              onClose();
            }}
            className={cn(
              "w-full flex items-center gap-3.5 px-3.5 py-3.5 rounded-[14px]",
              "hover:bg-muted/70 active:bg-muted active:scale-[0.98]",
              "transition-all duration-150 text-left group"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0",
              "bg-blue-50 dark:bg-blue-950/50",
              "transition-transform duration-150 group-active:scale-95"
            )}>
              <Camera className="w-[18px] h-[18px] text-blue-500 dark:text-blue-400" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold tracking-[-0.2px] text-foreground">
                카메라로 찍기
              </p>
              <p className="text-[11.5px] text-muted-foreground mt-[1px] leading-snug">
                카메라를 열어 영수증을 촬영해요
              </p>
            </div>
          </button>

          {/* 갤러리 */}
          <button
            type="button"
            onClick={() => {
              onGallery();
              onClose();
            }}
            className={cn(
              "w-full flex items-center gap-3.5 px-3.5 py-3.5 rounded-[14px]",
              "hover:bg-muted/70 active:bg-muted active:scale-[0.98]",
              "transition-all duration-150 text-left group"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0",
              "bg-violet-50 dark:bg-violet-950/50",
              "transition-transform duration-150 group-active:scale-95"
            )}>
              <Images className="w-[18px] h-[18px] text-violet-500 dark:text-violet-400" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold tracking-[-0.2px] text-foreground">
                앨범에서 선택
              </p>
              <p className="text-[11.5px] text-muted-foreground mt-[1px] leading-snug">
                사진 앨범에서 영수증을 가져와요
              </p>
            </div>
          </button>
        </div>

        {/* 취소 버튼 */}
        <div className="px-2.5 pb-2.5">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "w-full py-3.5 rounded-[14px]",
              "bg-muted/60 hover:bg-muted active:bg-muted/80 active:scale-[0.99]",
              "text-[13.5px] font-medium text-muted-foreground",
              "transition-all duration-150"
            )}
          >
            취소
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
