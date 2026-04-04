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
   TYPES
========================= */

type Props = {
  sections: CampaignStorySection[];
};

/* =========================
   CONFIG
========================= */

const COLLAPSE_HEIGHT = 720;

/* =========================
   MAIN COMPONENT
========================= */

export default function CampaignStoryRenderer({
  sections,
}: Props) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isOverflowing, setIsOverflowing] =
    useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      setIsOverflowing(
        containerRef.current.scrollHeight >
          COLLAPSE_HEIGHT
      );
    }
  }, [sections]);

  return (
    <section className="container-main mt-6 animate-fadeUp">

      {/* ================= CONTENT ================= */}
      <div
        ref={containerRef}
        className="relative space-y-6 overflow-hidden transition-all duration-500"
        style={{
          maxHeight: expanded
            ? "none"
            : `${COLLAPSE_HEIGHT}px`,
        }}
      >
        {sections.map((section) => (
          <StorySection
            key={section.id}
            section={section}
          />
        ))}

        {!expanded && isOverflowing && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[rgb(var(--color-bg))] via-[rgb(var(--color-bg))/0.9] to-transparent" />
        )}
      </div>

      {/* ================= TOGGLE ================= */}
      {isOverflowing && (
        <div className="flex justify-center">
          <button
            onClick={() =>
              setExpanded((prev) => !prev)
            }
            className="mt-6 btn btn-outline flex items-center gap-2"
          >
            {expanded
              ? "Tutup Cerita"
              : "Baca Selengkapnya"}

            <ChevronDown
              size={16}
              className={`transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
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
    /* ================= HEADING ================= */
    case "heading":
      return (
        <h2 className="h2 flex items-center gap-3">
          <span className="w-1.5 h-6 rounded-full bg-[rgb(var(--color-primary))]" />
          {section.content}
        </h2>
      );

    case "subheading":
      return (
        <h3 className="h3 text-[rgb(var(--color-text))]">
          {section.content}
        </h3>
      );

    /* ================= TEXT ================= */
    case "text":
      return (
        <p className="body text-[rgb(var(--color-text))]">
          {section.content}
        </p>
      );

    /* ================= IMAGE ================= */
    case "image":
      if (!section.image_id) return null;

      return (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[rgb(var(--color-border))]">
          <Image
            src={cloudinaryImage(
              section.image_id,
              1000
            )}
            alt="Campaign story image"
            width={1000}
            height={600}
            loading="lazy"
            className="w-full h-auto object-cover"
          />
        </div>
      );

    /* ================= QUOTE ================= */
    case "quote":
      return (
        <blockquote className="relative p-5 rounded-[var(--radius-lg)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-soft))] space-y-2">
          <Quote
            size={20}
            className="text-[rgb(var(--color-primary))]"
          />

          <p className="body italic text-[rgb(var(--color-muted))]">
            {section.content}
          </p>
        </blockquote>
      );

    /* ================= LIST (FIXED BUG HERE) ================= */
    case "list":
      if (!section.content) return null;

      return (
        <div className="space-y-3">
          {section.content
            .split("|")
            .map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))]"
              >
                <CheckCircle2
                  size={16}
                  className="mt-1 text-[rgb(var(--color-primary))]"
                />

                <p className="body text-[rgb(var(--color-text))]">
                  {item.trim()}
                </p>
              </div>
            ))}
        </div>
      );

    /* ================= HIGHLIGHT ================= */
    case "highlight_box":
      return (
        <div className="p-5 rounded-[var(--radius-lg)] border border-[rgb(var(--color-primary))/0.25] bg-[rgb(var(--color-primary))/0.06]">
          <p className="body text-[rgb(var(--color-text))]">
            {section.content}
          </p>
        </div>
      );

    /* ================= DIVIDER ================= */
    case "divider":
      return (
        <div className="h-px bg-[rgb(var(--color-border))]" />
      );

    /* ================= STATS ================= */
    case "stats":
      if (!section.content) return null;
      return <StatsSection content={section.content} />;

    /* ================= CARD GRID ================= */
    case "card_grid":
      if (!section.content) return null;
      return (
        <CardGridSection
          content={section.content}
        />
      );

    /* ================= CTA ================= */
    case "cta":
      return (
        <div className="p-6 rounded-[var(--radius-lg)] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-white))] text-center space-y-3 shadow-[var(--shadow-soft)]">
          <p className="body font-medium">
            {section.content}
          </p>

          <button className="btn bg-[rgb(var(--color-white))] text-[rgb(var(--color-primary))]">
            Donasi Sekarang
          </button>
        </div>
      );

    /* ================= VIDEO ================= */
    case "video":
      if (!section.video_url) return null;
      return (
        <LazyVideoEmbed url={section.video_url} />
      );

    default:
      return null;
  }
}

/* =========================
   STATS SECTION
========================= */

function StatsSection({
  content,
}: {
  content: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      {content.split("|").map((item, i) => {
        const parts = item.trim().split(" ");
        const number = parts[0];
        const label = parts
          .slice(1)
          .join(" ");

        return (
          <div
            key={i}
            className="p-4 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-soft))]"
          >
            <p className="h3 text-primary">
              {number}
            </p>

            <p className="caption">
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* =========================
   VIDEO EMBED
========================= */

function LazyVideoEmbed({
  url,
}: {
  url: string;
}) {
  const [loaded, setLoaded] =
    useState<boolean>(false);

  const extractVideoId = (
    input: string
  ): string | null => {
    if (!input.includes("/embed/"))
      return null;

    return (
      input
        .split("/embed/")[1]
        ?.split("?")[0] ?? null
    );
  };

  const videoId = extractVideoId(url);
  if (!videoId) return null;

  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] border border-[rgb(var(--color-border))]">
      {!loaded ? (
        <button
          onClick={() => setLoaded(true)}
          className="relative w-full h-full"
        >
          <Image
            src={thumbnail}
            alt="Video thumbnail"
            fill
            className="object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <PlayCircle
              size={56}
              className="text-white"
            />
          </div>
        </button>
      ) : (
        <iframe
          src={url}
          title="Campaign video"
          allow="autoplay; encrypted-media"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      )}
    </div>
  );
}