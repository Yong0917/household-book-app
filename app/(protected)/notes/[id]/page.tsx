import { notFound } from "next/navigation";
import { getNote } from "@/lib/actions/notes";
import { NoteEditor } from "@/components/notes/NoteEditor";

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) notFound();

  return <NoteEditor note={note} />;
}
