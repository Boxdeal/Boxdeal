"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { toast } from "sonner";

interface UploadedImage {
  url: string;
  thumbnail_url: string;
  is_primary: boolean;
}

interface ImageUploaderProps {
  productId: string;
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

export function ImageUploader({ productId, images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("product_id", productId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const { data, error } = await res.json();
        if (error) throw new Error(error);

        onChange([
          ...images,
          {
            url:          data.url,
            thumbnail_url: data.thumbnail_url,
            is_primary:   images.length === 0,
          },
        ]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    }
    setUploading(false);
  }

  function remove(idx: number) {
    const next = images.filter((_, i) => i !== idx);
    if (next.length > 0 && images[idx].is_primary) {
      next[0].is_primary = true;
    }
    onChange(next);
  }

  function setPrimary(idx: number) {
    onChange(images.map((img, i) => ({ ...img, is_primary: i === idx })));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors",
          uploading ? "border-brand-300 bg-brand-50" : "border-gray-200 hover:border-brand-300 hover:bg-gray-50"
        )}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        ) : (
          <ImagePlus className="h-8 w-8 text-gray-400" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {uploading ? "Uploading…" : "Drop images here or click to upload"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            JPG, PNG, WebP — up to 10MB each
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image src={img.thumbnail_url || img.url} alt="" fill className="object-cover" sizes="100px" />
              {img.is_primary && (
                <span className="absolute bottom-1 left-1 rounded bg-brand-500 px-1 py-0.5 text-xs font-bold text-white">
                  Main
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                {!img.is_primary && (
                  <button
                    onClick={() => setPrimary(idx)}
                    className="rounded bg-white px-1.5 py-1 text-xs font-semibold text-gray-700"
                  >
                    Set main
                  </button>
                )}
                <button
                  onClick={() => remove(idx)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
