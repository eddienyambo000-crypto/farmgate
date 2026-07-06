"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { createUploadUrl } from "@/lib/actions/upload";

interface Active {
  id: string;
  name: string;
  progress: number; // 0..100
}

/**
 * Fast, low-data-friendly image uploader:
 *  1. compresses on-device (≈1 MB, ≤1600px) so even 8 MB phone photos fly on slow data;
 *  2. uploads DIRECTLY to Supabase Storage via a signed URL (no 1 MB Server-Action
 *     limit, no double hop) with a real progress bar.
 * Falls back to pasting an image URL if a device has no camera/gallery access.
 */
export function ImageUploader({
  bucket = "fg-listings",
  value,
  onChange,
  single = false,
}: {
  bucket?: "fg-listings" | "fg-brand";
  value: string[];
  onChange: (urls: string[]) => void;
  single?: boolean;
}) {
  const [active, setActive] = useState<Active[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function setProgress(id: string, p: number) {
    setActive((a) => a.map((x) => (x.id === id ? { ...x, progress: p } : x)));
  }

  function putWithProgress(url: string, blob: Blob, type: string, id: string) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("content-type", type);
      xhr.setRequestHeader("cache-control", "max-age=3600");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(id, Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload failed (${xhr.status})`));
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(blob);
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const picked = single ? [files[0]] : Array.from(files);
    const added: string[] = [];

    for (const file of picked) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        continue;
      }
      const id = crypto.randomUUID();
      setActive((a) => [...a, { id, name: file.name, progress: 0 }]);
      try {
        let blob: Blob = file;
        try {
          blob = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            initialQuality: 0.8,
          });
        } catch {
          /* compression failed → upload original */
        }
        const ext = file.name.split(".").pop() || "jpg";
        const meta = await createUploadUrl(bucket, ext);
        if (!meta.ok || !meta.signedUrl || !meta.publicUrl)
          throw new Error(meta.error ?? "Could not start upload.");
        await putWithProgress(meta.signedUrl, blob, file.type, id);
        added.push(meta.publicUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setActive((a) => a.filter((x) => x.id !== id));
      }
    }
    if (added.length) onChange(single ? added.slice(-1) : [...value, ...added]);
  }

  function addUrl() {
    const v = urlInput.trim();
    if (!v) return;
    onChange(single ? [v] : value.includes(v) ? value : [...value, v]);
    setUrlInput("");
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {value.map((src) => (
            <div
              key={src}
              className="group relative h-24 w-24 overflow-hidden rounded-[var(--radius)] border border-line"
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== src))}
                aria-label="Remove photo"
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-forest-dark/85 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-danger cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {active.length > 0 && (
        <div className="mb-3 space-y-2">
          {active.map((a) => (
            <div key={a.id} className="rounded-[var(--radius)] border border-line bg-cream/40 p-2.5">
              <div className="mb-1 flex justify-between text-xs text-ink-soft">
                <span className="truncate">{a.name}</span>
                <span>{a.progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-forest transition-[width] duration-150"
                  style={{ width: `${a.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] border border-forest/30 bg-white px-4 text-sm font-semibold text-forest-deep transition-colors hover:border-forest cursor-pointer"
        >
          <UploadGlyph />
          {single ? "Upload image" : "Upload photos"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={!single}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="…or paste an image link"
          className="h-10 min-w-[180px] flex-1 rounded-[var(--radius)] border border-line bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-muted hover:border-forest/30 focus-visible:border-forest"
        />
      </div>

      <p className="mt-1.5 text-xs text-ink-muted">
        Photos are compressed automatically — works even on slow data.
      </p>
      {error && <p className="mt-1 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}

function UploadGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4M6 10l6-6 6 6" />
      <path d="M4 20h16" />
    </svg>
  );
}
