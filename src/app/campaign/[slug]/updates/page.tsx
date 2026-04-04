import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { getCampaignBySlug } from "@/lib/campaign.service";
import { getCampaignUpdates } from "@/lib/campaign.updates.service";

import CampaignHero from "@/components/campaign/CampaignHero";
import CampaignUpdatesTimeline from "@/components/campaign/CampaignUpdatesTimeline";
import CampaignUpdatesMediaGrid from "@/components/campaign/CampaignUpdatesMediaGrid";

/* ================= TYPES ================= */

type Props = {
  params: { slug: string };
};

/* ================= SAFE DATE ================= */

function safeDate(date?: string | null): string {
  if (!date) return "-";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ================= SAFE ARRAY ================= */

function ensureArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? data : [];
}

/* ================= SEO ================= */

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) {
    return { title: "Campaign tidak ditemukan" };
  }

  const title = `Kabar Terbaru ${campaign.title} | Update Donasi`;
  const description =
    campaign.short_tagline ||
    "Lihat perkembangan terbaru campaign, penyaluran dan realisasi bantuan.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

/* ================= PAGE ================= */

export default async function CampaignUpdatesPage({
  params,
}: Props) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) return notFound();

  /* 🔥 SAFE FETCH */
  const updatesRaw = await getCampaignUpdates(campaign.id);
  const updates = ensureArray<typeof updatesRaw[number]>(updatesRaw);

  /* ================= JSON-LD ================= */

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Kabar Terbaru ${campaign.title}`,
    description:
      campaign.short_tagline ||
      "Perkembangan terbaru campaign donasi",
    mainEntity: updates.map((u) => ({
      "@type": "NewsArticle",
      headline: u.title || "Update",
      datePublished: u.created_at || "",
      articleBody: u.content || "",
    })),
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] flex justify-center">
      <div className="w-full container-main bg-[rgb(var(--color-bg))] pb-24">

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />

        {/* ================= NAVBAR ================= */}
        <div className="sticky top-0 z-40 backdrop-blur bg-[rgb(var(--color-bg))]/90 border-b border-[rgb(var(--color-border))]">

          <div className="flex items-center gap-3 px-3 py-3">

            <Link
              href={`/campaign/${campaign.slug}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-soft))] transition"
            >
              <span>←</span>
              <span className="caption font-medium">
                Kembali
              </span>
            </Link>

            <div className="h-4 w-px bg-[rgb(var(--color-border))]" />

            <p className="caption truncate">
              {campaign.title}
            </p>

          </div>
        </div>

        {/* ================= HERO ================= */}
        <CampaignHero
          title="Kabar Terbaru"
          image={campaign.hero_image_public_id}
          videoUrl={campaign.hero_video_url}
        />

        {/* ================= HEADER ================= */}
        <div className="section space-y-3">

          <h1 className="h1">
            Update Campaign
          </h1>

          <p className="body text-[rgb(var(--color-muted))]">
            Perkembangan terbaru dari{" "}
            <span className="font-medium text-[rgb(var(--color-text))]">
              {campaign.title}
            </span>
          </p>

        </div>

        {/* ================= EMPTY ================= */}
        {updates.length === 0 && (
          <div className="section">
            <div className="card text-center space-y-2">

              <p className="body">
                Belum ada kabar terbaru 📭
              </p>

              <p className="caption text-[rgb(var(--color-muted))]">
                Update akan muncul ketika campaign berjalan.
              </p>

            </div>
          </div>
        )}

        {/* ================= MEDIA ================= */}
        {updates.length > 0 && (
          <div className="section-tight space-y-4">

            <h2 className="h3">Dokumentasi 📸</h2>

            <CampaignUpdatesMediaGrid updates={updates} />

          </div>
        )}

        {/* ================= TIMELINE ================= */}
        {updates.length > 0 && (
          <div className="section-tight">

            <CampaignUpdatesTimeline updates={updates} />

          </div>
        )}

      </div>
    </div>
  );
}