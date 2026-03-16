"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy, Pin, PinOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  updateNote,
  deleteNote,
  addNote,
  togglePinNote,
  type Note,
} from "@/lib/actions/notes";

interface NoteEditorProps {
  note: Note;
}

export function NoteEditor({ note: initialNote }: NoteEditorProps) {
  const router = useRouter();
  const [note, setNote] = useState<Note>(initialNote);
  const [title, setTitle] = useState(initialNote.title ?? "");
  const [content, setContent] = useState(initialNote.content ?? "");
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateNote(note.id, { title, content });
      setNote((prev) => ({
        ...prev,
        title: title || null,
        content: content || null,
        updated_at: new Date().toISOString(),
      }));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    setSaving(true);
    try {
      await deleteNote(note.id);
      router.push("/notes");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    setSaving(true);
    try {
      await addNote({
        title: note.title ? `${note.title} (복사본)` : undefined,
        content: note.content ?? undefined,
      });
      router.push("/notes");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePin() {
    setSaving(true);
    try {
      await togglePinNote(note.id, note.is_pinned);
      setNote((prev) => ({ ...prev, is_pinned: !prev.is_pinned }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* 상단 툴바 */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border/40 shrink-0">
          {/* 왼쪽: 뒤로가기 */}
          <button
            onClick={() => router.push("/notes")}
            disabled={saving}
            className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* 오른쪽: 액션 + 저장 */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleTogglePin}
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

            <button
              onClick={handleCopy}
              disabled={saving}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="h-5 w-5" />
            </button>

            <button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={saving}
              className="p-2 rounded-full text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>

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
        <div className="flex-1 flex flex-col overflow-auto px-5 pt-4 pb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 mb-3"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="메모를 입력하세요..."
            className="flex-1 w-full min-h-[60vh] text-sm bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed"
          />
        </div>
      </div>

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
