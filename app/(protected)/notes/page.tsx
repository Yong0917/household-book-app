import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNotes } from "@/lib/actions/notes";
import { NoteList } from "@/components/notes/NoteList";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isGuest = !data?.claims;

  return (
    <div className="flex flex-col h-dvh">
      {/* 헤더 */}
      <div className="px-5 pb-4 shrink-0" style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}>
        <h1 className="text-2xl font-bold">메모</h1>
      </div>

      {isGuest ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 pb-20">
          <Lock className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">메모는 로그인 후 이용할 수 있습니다</p>
          <Link
            href="/auth/login"
            className="text-[13.5px] font-semibold text-primary hover:opacity-70 transition-opacity"
          >
            로그인하기
          </Link>
        </div>
      ) : (
        <NoteList initialNotes={await getNotes()} />
      )}
    </div>
  );
}
