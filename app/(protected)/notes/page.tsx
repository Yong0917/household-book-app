import { getNotes } from "@/lib/actions/notes";
import { NoteList } from "@/components/notes/NoteList";

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div className="flex flex-col h-dvh">
      {/* 헤더 */}
      <div className="px-5 pb-4 shrink-0" style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}>
        <h1 className="text-2xl font-bold">메모</h1>
      </div>

      <NoteList initialNotes={notes} />
    </div>
  );
}
