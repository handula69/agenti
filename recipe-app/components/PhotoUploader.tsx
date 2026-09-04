"use client";

import { useRef, useState } from "react";
import { UploadedImage } from "@/lib/types";
import { resizeImageToBase64 } from "@/lib/clientImage";

const MAX_IMAGES = 10;

export interface PhotoItem extends UploadedImage {
  previewUrl: string;
  existingUrl?: string; // vyplněno u fotek, které už jsou uložené (edit režim)
}

export function PhotoUploader({
  photos,
  onChange,
}: {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = MAX_IMAGES - photos.length;
    if (remaining <= 0) {
      setError(`Maximum je ${MAX_IMAGES} fotek na jeden recept.`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    setBusy(true);
    try {
      const resized = await Promise.all(selected.map((f) => resizeImageToBase64(f)));
      const newItems: PhotoItem[] = resized.map((img) => ({
        ...img,
        previewUrl: `data:${img.contentType};base64,${img.dataBase64}`,
      }));
      onChange([...photos, ...newItems]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Zpracování fotek selhalo.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-700">Fotky receptu ({photos.length}/{MAX_IMAGES})</label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || photos.length >= MAX_IMAGES}
          className="text-sm rounded-lg border border-brand-300 text-brand-700 px-3 py-1.5 disabled:opacity-50"
        >
          {busy ? "Zpracovávám..." : "+ Přidat fotky"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {photos.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((photo, i) => (
            <li key={photo.existingUrl ?? photo.previewUrl} className="relative group">
              {/* náhledy jsou lokální data URL / už uložené URL, obyčejný img je zde jednodušší než next/image */}
              <img
                src={photo.previewUrl}
                alt={`Fotka receptu ${i + 1}`}
                className="w-full aspect-square object-cover rounded-lg border border-stone-200"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-between p-1 bg-black/40 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => move(i, -1)} className="text-white text-xs px-1" aria-label="Posunout doleva">
                  ←
                </button>
                <button type="button" onClick={() => remove(i)} className="text-white text-xs px-1" aria-label="Odebrat fotku">
                  ✕
                </button>
                <button type="button" onClick={() => move(i, 1)} className="text-white text-xs px-1" aria-label="Posunout doprava">
                  →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
