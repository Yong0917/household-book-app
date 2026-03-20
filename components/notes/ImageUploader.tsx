"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage, extractStoragePath } from "@/lib/utils/imageUtils";
import { ImageViewer } from "@/components/notes/ImageViewer";

const BUCKET = "note-images";
const MAX_IMAGES = 5;

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

export function ImageUploader({ images, onChange, disabled }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("인증이 필요합니다.");

      const urls: string[] = [];
      for (const file of toUpload) {
        const compressed = await compressImage(file);
        const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const path = `${user.id}/${filename}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, compressed, { contentType: "image/jpeg" });

        if (error) throw error;

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        urls.push(data.publicUrl);
      }

      onChange([...images, ...urls]);
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
    } finally {
      setUploading(false);
      // input 초기화 (같은 파일 재선택 가능하도록)
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(url: string) {
    const supabase = createClient();
    const path = extractStoragePath(url, BUCKET);
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
    onChange(images.filter((u) => u !== url));
  }

  const canAdd = images.length < MAX_IMAGES && !disabled;

  return (
    <>
    <div className="flex flex-wrap gap-2 mt-3">
      {images.map((url) => (
        <div key={url} className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="첨부 이미지"
            onClick={() => setViewerUrl(url)}
            className="w-20 h-20 object-cover rounded-xl border border-border/40 cursor-pointer active:scale-95 transition-transform"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {canAdd && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 shrink-0 rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-1 text-muted-foreground/50 hover:border-primary/40 hover:text-primary/60 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px]">사진 추가</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
    {viewerUrl && (
      <ImageViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />
    )}
    </>
  );
}
