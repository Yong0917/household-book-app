"use client";

import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Copy, Pin, PinOff, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ImageUploader } from "@/components/notes/ImageUploader";
import type { Note } from "@/lib/actions/notes";

interface NoteSheetProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; images: string[] }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCopy?: () => Promise<void>;
  onTogglePin?: () => Promise<void>;
}

export function NoteSheet({
  note,
  open,
  onClose,
  onSave,
  onDelete,
  onCopy,
  onTogglePin,
}: NoteSheetProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // 시트 열릴 때 초기값 세팅 + 뒤로가기 히스토리 등록
  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? "");
      setContent(note?.content ?? "");
      setImages(note?.images ?? []);
      if (!note) {
        setTimeout(() => contentRef.current?.focus(), 100);
      }

      history.pushState({ noteSheet: true }, "");
      const handlePopState = () => {
        onClose();
      };
      window.addEventListener("popstate", handlePopState, { once: true });
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSave() {
    if (!title.trim() && !content.trim() && images.length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await onSave({ title, content, images });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!onDelete) return;
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    if (!onCopy) return;
    setSaving(true);
    try {
      await onCopy();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content
            className={cn(
              "fixed inset-0 z-50 flex flex-col bg-background",
              "focus:outline-none"
            )}
          >
            <VisuallyHidden.Root>
              <Drawer.Title>메모 편집</Drawer.Title>
            </VisuallyHidden.Root>
            <div className="h-[env(safe-area-inset-top)] flex-shrink-0" />

            {/* 상단 툴바 */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border/40 shrink-0">
              {/* 왼쪽: 닫기 버튼 */}
              <button
                onClick={onClose}
                disabled={saving}
                className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* 오른쪽: 액션 버튼들 + 저장 */}
              <div className="flex items-center gap-1">
                {note && onTogglePin && (
                  <button
                    onClick={onTogglePin}
                    disabled={saving}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      note.is_pinned
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {note.is_pinned ? (
                      <PinOff className="h-5 w-5" />
                    ) : (
                      <Pin className="h-5 w-5" />
                    )}
                  </button>
                )}
                {note && onCopy && (
                  <button
                    onClick={handleCopy}
                    disabled={saving}
                    className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                )}
                {note && onDelete && (
                  <button
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={saving}
                    className="p-2 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}

                {/* 저장 버튼 */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="ml-1 px-3 py-1.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>

            {/* 편집 영역 */}
            <div className="flex-1 flex flex-col overflow-hidden px-5 pt-4">
              {/* 제목 */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 mb-3 shrink-0"
              />
              {/* 본문 — 내부 스크롤 */}
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="메모를 입력하세요..."
                className="flex-1 w-full text-sm bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed overflow-auto"
              />
              {/* 이미지 업로더 — 하단 고정 */}
              <div className="shrink-0 pb-24 pt-2">
                <ImageUploader
                  images={images}
                  onChange={setImages}
                  disabled={saving}
                />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* 삭제 확인 모달 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="메모를 삭제할까요?"
        description="삭제된 메모는 복구할 수 없습니다."
        confirmLabel="삭제"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
