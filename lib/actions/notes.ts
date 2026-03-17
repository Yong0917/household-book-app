"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Note {
  id: string;
  title: string | null;
  content: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export async function getNotes(): Promise<Note[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notes")
    .select("id, title, content, is_pinned, created_at, updated_at")
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addNote(data: { title?: string; content?: string }): Promise<Note> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");

  const { data: note, error } = await supabase
    .from("notes")
    .insert({ user_id: user.id, title: data.title || null, content: data.content || null })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
  return note;
}

export async function updateNote(
  id: string,
  data: { title?: string; content?: string }
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");

  const { error } = await supabase
    .from("notes")
    .update({ title: data.title || null, content: data.content || null })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}

export async function getNote(id: string): Promise<Note | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("notes")
    .select("id, title, content, is_pinned, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data;
}

export async function searchNotes(query: string): Promise<Note[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from("notes")
    .select("id, title, content, is_pinned, created_at, updated_at")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function togglePinNote(id: string, currentPinned: boolean): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("인증이 필요합니다.");

  const { error } = await supabase
    .from("notes")
    .update({ is_pinned: !currentPinned })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}
