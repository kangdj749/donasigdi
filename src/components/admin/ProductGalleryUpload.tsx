"use client";

import Image from "next/image";
import { useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadCloudinary";

export function ProductGalleryUpload({
  value,
  onChange,
}: {
  value: string[];
  onChange: (images: string[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setLoading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const u = await uploadToCloudinary(file);
        uploadedUrls.push(u.secure_url);
      }

      onChange([...value, ...uploadedUrls]);
    } catch {
      alert("Gagal upload gallery");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
      />

      {loading && (
        <p className="text-sm text-gray-500">
          Uploading gallery...
        </p>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square rounded overflow-hidden border"
            >
              <Image
                src={url}
                alt={`Gallery ${i + 1}`}
                fill
                sizes="150px"
                className="object-cover"
              />

              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
