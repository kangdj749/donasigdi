"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CampaignStorySection } from "@/lib/campaign.service";
import { cloudinaryImage } from "@/lib/cloudinary";
import { ChevronDown, PlayCircle } from "lucide-react";

type Props = {
  sections: CampaignStorySection[];
};

const COLLAPSE_HEIGHT = 600;

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
    <section className="px-4 mt-6 max-w-md mx-auto">
      <div
        ref={containerRef}
        className="relative space-y-6 overflow-hidden transition-all duration-500"
        style={{
          maxHeight: expanded ? "none" : COLLAPSE_HEIGHT,
        }}
      >
        {sections.map((section) => (
          <StorySection key={section.id} section={section} />
        ))}

        {!expanded && isOverflowing && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      {isOverflowing && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center justify-center gap-2 text-primary font-medium text-sm"
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
   STORY SECTION
========================= */

function StorySection({
  section,
}: {
  section: CampaignStorySection;
}) {
  switch (section.type) {
    case "heading":
      return (
        <h2 className="text-lg font-semibold mt-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full" />
          {section.content}
        </h2>
      );

    case "subheading":
      return (
        <h3 className="text-base font-medium text-gray-700 mt-4">
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
        <Image
          src={cloudinaryImage(section.image_id, 900)}
          alt="Campaign"
          width={900}
          height={600}
          loading="lazy"
          className="rounded-xl w-full h-auto object-cover"
        />
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600 text-sm">
          {section.content}
        </blockquote>
      );

    case "list":
      if (!section.content) return null;
      const items = section.content.split("|");
      return (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1 w-2 h-2 bg-primary rounded-full" />
              {item.trim()}
            </li>
          ))}
        </ul>
      );

    case "video":
      if (!section.video_url) return null;
      return <LazyVideoEmbed url={section.video_url} />;

    default:
      return null;
  }
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
    <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm">
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
            <PlayCircle size={60} className="text-white" />
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

