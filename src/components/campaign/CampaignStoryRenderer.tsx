"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CampaignStorySection } from "@/lib/campaign.service";
import { cloudinaryImage } from "@/lib/cloudinary";
import {
  ChevronDown,
  PlayCircle,
  Quote,
  CheckCircle2,
} from "lucide-react";
import CardGridSection from "./CardGridSection";

/* =========================
   MAIN RENDERER
========================= */

type Props = {
  sections: CampaignStorySection[];
};

const COLLAPSE_HEIGHT = 700;

export default function CampaignStoryRenderer({ sections }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setIsOverflowing(
        containerRef.current.scrollHeight > COLLAPSE_HEIGHT
      );
    }
  }, [sections]);

  return (
    <section className="px-4 mt-10 max-w-lg mx-auto">
      <div
        ref={containerRef}
        className="relative space-y-8 overflow-hidden transition-all duration-500"
        style={{
          maxHeight: expanded ? "none" : COLLAPSE_HEIGHT,
        }}
      >
        {sections.map((section) => (
          <StorySection key={section.id} section={section} />
        ))}

        {!expanded && isOverflowing && (
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-white via-white/90 to-transparent pointer-events-none" />
        )}
      </div>

      {isOverflowing && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-6 flex items-center justify-center gap-2 text-primary font-semibold text-sm mx-auto"
        >
          {expanded ? "Tutup Cerita" : "Baca Selengkapnya"}
          <ChevronDown
            size={18}
            className={`transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </section>
  );
}

/* =========================
   STORY SECTION SWITCH
========================= */

function StorySection({
  section,
}: {
  section: CampaignStorySection;
}) {
  const type = section.type?.trim();

  switch (type) {
    case "heading":
      return (
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="w-1.5 h-8 bg-primary rounded-full" />
          {section.content}
        </h2>
      );

    case "subheading":
      return (
        <h3 className="text-base font-semibold text-gray-800">
          {section.content}
        </h3>
      );

    case "text":
      return (
        <p className="text-sm leading-relaxed text-gray-700">
          {section.content}
        </p>
      );

    case "image":
      if (!section.image_id) return null;
      return (
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <Image
            src={cloudinaryImage(section.image_id, 1000)}
            alt="Campaign"
            width={1000}
            height={600}
            loading="lazy"
            className="w-full h-auto object-cover"
          />
        </div>
      );

    case "quote":
      return (
        <blockquote className="relative bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <Quote
            className="absolute -top-3 -left-3 text-primary bg-white rounded-full p-1 shadow-sm"
            size={28}
          />
          <p className="italic text-gray-600 text-sm">
            {section.content}
          </p>
        </blockquote>
      );

    case "list":
      if (!section.content) return null;
      return (
        <div className="grid gap-3">
          {section.content.split("|").map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <CheckCircle2
                size={18}
                className="text-primary mt-1 shrink-0"
              />
              <p className="text-sm text-gray-700">
                {item.trim()}
              </p>
            </div>
          ))}
        </div>
      );

    case "highlight_box":
      return (
        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 text-sm text-gray-700">
          {section.content}
        </div>
      );

    case "divider":
      return <div className="h-px bg-gray-200 my-6" />;

    case "stats":
      if (!section.content) return null;
      return <StatsSection content={section.content} />;

    case "card_grid":
      if (!section.content) return null;
      return <CardGridSection content={section.content} />;

    case "cta":
      return (
        <div className="p-6 rounded-2xl bg-primary text-white text-center space-y-3">
          <p className="text-sm font-medium">{section.content}</p>
          <button className="bg-white text-primary px-5 py-2 rounded-full text-sm font-semibold">
            Donasi Sekarang
          </button>
        </div>
      );

    case "video":
      if (!section.video_url) return null;
      return <LazyVideoEmbed url={section.video_url} />;

    default:
      return null;
  }
}

/* =========================
   STATS SECTION
   format: "5000 Paket|2000 Anak|50 Titik"
========================= */

function StatsSection({ content }: { content: string }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      {content.split("|").map((item, i) => {
        const parts = item.trim().split(" ");
        const number = parts[0];
        const label = parts.slice(1).join(" ");

        return (
          <div
            key={i}
            className="p-4 bg-gray-50 rounded-xl border border-gray-100"
          >
            <p className="text-lg font-bold text-primary">
              {number}
            </p>
            <p className="text-xs text-gray-600">
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* =========================
   LAZY VIDEO
========================= */

function LazyVideoEmbed({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);

  const extractVideoId = (input: string) => {
    if (!input.includes("/embed/")) return null;
    return input.split("/embed/")[1]?.split("?")[0];
  };

  const videoId = extractVideoId(url);
  if (!videoId) return null;

  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm">
      {!loaded ? (
        <button
          onClick={() => setLoaded(true)}
          className="relative w-full h-full"
        >
          <Image
            src={thumbnail}
            alt="Video Thumbnail"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <PlayCircle
              size={64}
              className="text-white drop-shadow-lg"
            />
          </div>
        </button>
      ) : (
        <iframe
          src={url}
          title="Campaign Video"
          allow="autoplay; encrypted-media"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      )}
    </div>
  );
}
