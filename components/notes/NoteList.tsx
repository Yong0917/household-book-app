"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pin, Plus, Search, StickyNote } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { NoteSheet } from "./NoteSheet";
import {
  addNote,
  updateNote,
  deleteNote,
  togglePinNote,
  searchNotes,
  type Note,
} from "@/lib/actions/notes";

interface NoteListProps {
  initialNotes: Note[];
}

function formatDate(dateStr: string) {
  const date = parseISO(dateStr);
  if (isToday(date)) return "오늘";
  if (isYesterday(date)) return "어제";
  return format(date, "M월 d일", { locale: ko });
}

function NoteCard({
  note,
  onClick,
}: {
  note: Note;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 rounded-2xl bg-card border border-border/40 active:scale-[0.98] transition-transform flex items-center gap-3"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold truncate">
            {note.title || <span className="text-muted-foreground/50 font-normal">제목 없음</span>}
          </span>
          {note.is_pinned && (
            <Pin className="h-3 w-3 text-primary shrink-0" />
          )}
        </div>
        {note.content && (
          <p className="text-xs text-muted-foreground truncate">{note.content}</p>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground/40 shrink-0">
        {formatDate(note.updated_at)}
      </span>
    </button>
  );
}

export function NoteList({ initialNotes }: NoteListProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await searchNotes(query);
      setSearchResults(results);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const pinned = notes.filter((n) => n.is_pinned);
  const unpinned = notes.filter((n) => !n.is_pinned);

  function openNew() {
    setSelectedNote(null);
    setSheetOpen(true);
  }

  function openNote(note: Note) {
    router.push(`/notes/${note.id}`);
  }

  async function handleSave(data: { title: string; content: string }) {
    if (selectedNote) {
      await updateNote(selectedNote.id, data);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNote.id
            ? { ...n, title: data.title || null, content: data.content || null, updated_at: new Date().toISOString() }
            : n
        )
      );
    } else {
      const note = await addNote(data);
      setNotes((prev) => [note, ...prev]);
    }
  }

  async function handleDelete() {
    if (!selectedNote) return;
    await deleteNote(selectedNote.id);
    setNotes((prev) => prev.filter((n) => n.id !== selectedNote.id));
  }

  async function handleCopy() {
    if (!selectedNote) return;
    const note = await addNote({
      title: selectedNote.title ? `${selectedNote.title} (복사본)` : undefined,
      content: selectedNote.content ?? undefined,
    });
    setNotes((prev) => [note, ...prev]);
  }

  async function handleTogglePin() {
    if (!selectedNote) return;
    await togglePinNote(selectedNote.id, selectedNote.is_pinned);
    const updated = { ...selectedNote, is_pinned: !selectedNote.is_pinned };
    setSelectedNote(updated);
    setNotes((prev) =>
      prev
        .map((n) => (n.id === selectedNote.id ? updated : n))
        .sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        })
    );
  }

  return (
    <>
      {/* 검색 인풋 */}
      <div className="px-4 pb-5 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/60 border border-border/40">
          <Search className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="메모 검색..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-6">
        {/* 검색 중 */}
        {query.trim() ? (
          searchResults === null ? (
            <div className="flex justify-center pt-12">
              <p className="text-sm text-muted-foreground/40">검색 중...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/40 pt-24">
              <Search className="h-12 w-12" strokeWidth={1.2} />
              <p className="text-sm">검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {searchResults.map((note) => (
                <NoteCard key={note.id} note={note} onClick={() => openNote(note)} />
              ))}
            </div>
          )
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/40 pt-24">
            <StickyNote className="h-12 w-12" strokeWidth={1.2} />
            <p className="text-sm">메모가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pinned.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2 px-1">
                  고정됨
                </h2>
                <div className="flex flex-col gap-2">
                  {pinned.map((note) => (
                    <NoteCard key={note.id} note={note} onClick={() => openNote(note)} />
                  ))}
                </div>
              </section>
            )}
            {unpinned.length > 0 && (
              <section>
                {pinned.length > 0 && (
                  <h2 className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2 px-1">
                    모든 메모
                  </h2>
                )}
                <div className="flex flex-col gap-2">
                  {unpinned.map((note) => (
                    <NoteCard key={note.id} note={note} onClick={() => openNote(note)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openNew}
        className={cn(
          "fixed bottom-20 right-5 z-40",
          "w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg",
          "flex items-center justify-center",
          "active:scale-95 transition-transform"
        )}
      >
        <Plus className="h-6 w-6" />
      </button>

      <NoteSheet
        note={selectedNote}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
        onDelete={selectedNote ? handleDelete : undefined}
        onCopy={selectedNote ? handleCopy : undefined}
        onTogglePin={selectedNote ? handleTogglePin : undefined}
      />
    </>
  );
}
