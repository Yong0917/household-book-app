"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Note {
  id: string;
  title: string | null;
  content: string | null;
  images: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export async function getNotes(): Promise<Note[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) return [];

  const { data, error } = await supabase
    .from("notes")
    .select("id, title, content, images, is_pinned, created_at, updated_at")
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addNote(data: { title?: string; content?: string; images?: string[] }): Promise<Note> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다.");
  const userId = authData.claims.sub as string;

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      title: data.title || null,
      content: data.content || null,
      images: data.images ?? [],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  return note;
}

export async function updateNote(
  id: string,
  data: { title?: string; content?: string; images?: string[] }
): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다.");
  const userId = authData.claims.sub as string;

  const payload: Record<string, unknown> = {
    title: data.title || null,
    content: data.content || null,
  };
  if (data.images !== undefined) payload.images = data.images;

  const { error } = await supabase
    .from("notes")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다.");
  const userId = authData.claims.sub as string;

  // DELETE...RETURNING으로 조회+삭제를 한 번의 DB 왕복으로 처리
  const { data: deleted, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("images")
    .single();

  if (error) throw new Error(error.message);

  // 첨부된 이미지를 Storage에서 삭제
  if (deleted?.images?.length) {
    const paths = (deleted.images as string[]).map((url: string) => {
      const marker = "/note-images/";
      const idx = url.indexOf(marker);
      return idx !== -1 ? url.slice(idx + marker.length) : "";
    }).filter(Boolean);
    if (paths.length) {
      await supabase.storage.from("note-images").remove(paths);
    }
  }
  revalidatePath("/notes");
}

export async function getNote(id: string): Promise<Note | null> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) return null;
  const userId = authData.claims.sub as string;

  const { data, error } = await supabase
    .from("notes")
    .select("id, title, content, images, is_pinned, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function searchNotes(query: string): Promise<Note[]> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) return [];

  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from("notes")
    .select("id, title, content, images, is_pinned, created_at, updated_at")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function togglePinNote(id: string, currentPinned: boolean): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData) throw new Error("인증이 필요합니다.");
  const userId = authData.claims.sub as string;

  const { error } = await supabase
    .from("notes")
    .update({ is_pinned: !currentPinned })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}
