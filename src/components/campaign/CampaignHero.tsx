"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { cloudinaryImage } from "@/lib/cloudinary";

type Props = {
  title: string;
  image?: string;
  videoUrl?: string;
};

export default function CampaignHero({
  title,
  image,
  videoUrl,
}: Props) {
  const [playing, setPlaying] = useState(false);

  const hasVideo = Boolean(videoUrl);
  const hasImage = Boolean(image);

  if (!hasVideo && !hasImage) return null;

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden">

      {/* ================= VIDEO MODE ================= */}
      {hasVideo ? (
        playing ? (
          <iframe
            src={`${videoUrl}?autoplay=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="relative w-full h-full group"
          >
            {hasImage ? (
              <Image
                src={cloudinaryImage(image!, 1200)}
                alt={title}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-900" />
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition">
              <PlayCircle size={70} className="text-white drop-shadow-lg" />
            </div>
          </button>
        )
      ) : (
        /* ================= IMAGE ONLY ================= */
        <Image
          src={cloudinaryImage(image!, 1200)}
          alt={title}
          fill
          priority
          className="object-cover"
        />
      )}
    </div>
  );
}
