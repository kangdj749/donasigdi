"use client";

import Image from "next/image";
import { CampaignUpdate } from "@/lib/campaign.updates.service";
import { cloudinaryImage } from "@/lib/cloudinary";

/* ================= TYPES ================= */

type Props = {
  updates: CampaignUpdate[];
};

/* ================= MAIN ================= */

export default function CampaignUpdatesTimeline({
  updates,
}: Props) {
  if (!updates.length) return null;

  return (
    <section className="section space-y-6">

      {/* HEADER */}
      <div className="text-center max-w-lg mx-auto space-y-2">
        <h2 className="h2">
          Perkembangan Terbaru 🔥
        </h2>
        <p className="caption">
          Transparansi penyaluran dan dampak nyata dari donasi
        </p>
      </div>

      {/* TIMELINE */}
      <div className="relative border-l border-[rgb(var(--color-border))] ml-3 space-y-6">

        {updates.slice(0, 6).map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}

      </div>

    </section>
  );
}

/* ================= ITEM ================= */

function TimelineItem({ item }: { item: CampaignUpdate }) {
  return (
    <div className="relative pl-6">

      {/* DOT */}
      <span className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-[rgb(var(--color-primary))] border-2 border-[rgb(var(--color-bg))]" />

      <div className="card space-y-3">

        {/* DATE */}
        <p className="caption text-[rgb(var(--color-muted))]">
          {formatDate(item.created_at)}
        </p>

        {/* TYPE */}
        {item.type === "disbursement" && (
          <p className="text-[11px] text-[rgb(var(--color-primary))] font-medium">
            💸 Penyaluran Dana
          </p>
        )}

        {/* TITLE */}
        {item.title && (
          <h3 className="body font-semibold">
            {item.title}
          </h3>
        )}

        {/* CONTENT */}
        {item.content && (
          <p className="caption leading-relaxed">
            {item.content}
          </p>
        )}

        {/* IMAGE */}
        {item.image_id && (
          <div className="overflow-hidden rounded-xl border border-[rgb(var(--color-border))]">
            <Image
              src={cloudinaryImage(item.image_id, 900)}
              alt="Update"
              width={900}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* VIDEO */}
        {item.video_url && (
          <iframe
            src={item.video_url}
            className="w-full aspect-video rounded-xl"
            loading="lazy"
            allowFullScreen
          />
        )}

        {/* AMOUNT */}
        {item.amount > 0 && (
          <p className="h3 text-[rgb(var(--color-primary))]">
            Rp {item.amount.toLocaleString("id-ID")}
          </p>
        )}

      </div>

    </div>
  );
}

/* ================= HELPER ================= */

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}