"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle, X } from "lucide-react";
import { cloudinaryImage } from "@/lib/cloudinary";

/* ================= TYPES ================= */

export type CampaignUpdate = {
  id: string;
  title?: string;
  content?: string;
  type?: string;
  image_id?: string;
  video_url?: string;
  created_at?: string;
};

/* ================= COMPONENT ================= */

export default function CampaignUpdatesMediaGrid({
  updates,
}: {
  updates: CampaignUpdate[];
}) {
  const [active, setActive] =
    useState<CampaignUpdate | null>(null);

  /* ================= FILTER MEDIA ================= */

  const mediaUpdates = updates.filter(
    (u) => u.image_id || u.video_url
  );

  if (mediaUpdates.length === 0) return null;

  return (
    <>
      {/* ================= GRID ================= */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2">

        {mediaUpdates.map((u) => (
          <button
            key={u.id}
            onClick={() => setActive(u)}
            className="relative aspect-square overflow-hidden group"
          >

            {/* IMAGE */}
            {u.image_id && (
              <Image
                src={cloudinaryImage(u.image_id, 500)}
                alt={u.title || "Update media"}
                fill
                className="object-cover group-hover:scale-105 transition"
              />
            )}

            {/* VIDEO OVERLAY */}
            {u.video_url && (
              <>
                <div className="absolute inset-0 bg-black/30" />

                <PlayCircle
                  size={32}
                  className="absolute inset-0 m-auto text-white"
                />
              </>
            )}

          </button>
        ))}

      </div>

      {/* ================= MODAL ================= */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">

          <div className="relative w-full max-w-3xl">

            {/* CLOSE */}
            <button
              onClick={() => setActive(null)}
              className="absolute top-3 right-3 z-10 bg-black/50 rounded-full p-2"
            >
              <X className="text-white" />
            </button>

            {/* CONTENT */}
            <div className="bg-black rounded-xl overflow-hidden">

              {/* IMAGE */}
              {active.image_id && (
                <Image
                  src={cloudinaryImage(active.image_id, 1000)}
                  alt={active.title || "Update"}
                  width={1000}
                  height={700}
                  className="w-full h-auto object-cover"
                />
              )}

              {/* VIDEO */}
              {active.video_url && (
                <iframe
                  src={active.video_url}
                  className="w-full aspect-video"
                  allowFullScreen
                />
              )}

              {/* TEXT */}
              <div className="p-4 space-y-2 bg-[rgb(var(--color-bg))]">

                {active.title && (
                  <p className="body font-medium">
                    {active.title}
                  </p>
                )}

                {active.content && (
                  <p className="caption text-[rgb(var(--color-muted))]">
                    {active.content}
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>
      )}
    </>
  );
}