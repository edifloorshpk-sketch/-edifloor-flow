"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadProjectPhoto, deleteProjectPhoto } from "@/app/actions/photos";
import { Camera, Trash2, Loader2 } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  file_name: string;
  file_path: string;
  category: string;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "para", label: "Para punimeve" },
  { key: "gjate", label: "Gjatë punimeve" },
  { key: "pas", label: "Pas punimeve" },
];

export function PhotoUploader({ projectId, initialPhotos }: { projectId: string; initialPhotos: Photo[] }) {
  const [pending, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState("gjate");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);
    formData.append("category", activeCategory);
    startTransition(async () => {
      await uploadProjectPhoto(formData);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              activeCategory === c.key ? "bg-gold text-gold-foreground" : "border border-border text-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="tap-target flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm text-muted hover:border-gold hover:text-gold"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        Shto fotografi — {CATEGORIES.find((c) => c.key === activeCategory)?.label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {CATEGORIES.map((c) => {
        const photos = initialPhotos.filter((p) => p.category === c.key);
        if (photos.length === 0) return null;
        return (
          <div key={c.key}>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">{c.label}</p>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p) => (
                <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.file_name} className="h-full w-full object-cover" />
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await deleteProjectPhoto(p.id, p.file_path, projectId);
                        router.refresh();
                      })
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
