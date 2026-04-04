import Link from "next/link";
import { notFound } from "next/navigation";

import { getCampaignBySlug } from "@/lib/campaign.service";
import {
  getRecentPrayers,
  type Prayer,
} from "@/lib/campaign.extras.service";
import { getViralPrayers } from "@/lib/campaign.extras.service";
import CampaignPrayersSection from "@/components/campaign/sections/CampaignPrayersSection";

/* =========================
   CONFIG
========================= */

export const revalidate = 60;

/* =========================
   SEO META (ENHANCED)
========================= */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) return {};

  const title = `Doa untuk ${campaign.title} | Dukung & Aminkan`;
  const description = `Kumpulan doa terbaik untuk ${campaign.title}. Aminkan doa, bagikan harapan, dan bantu mereka sekarang 🙏`;

  return {
    title,
    description,
    alternates: {
      canonical: `/campaign/${campaign.slug}/prayers`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/campaign/${campaign.slug}/prayers`,
    },
  };
}

/* =========================
   PAGE
========================= */

export default async function CampaignPrayersPage({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) return notFound();

  const prayers: Prayer[] = await getViralPrayers(
    campaign.id
  );

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] flex justify-center">
      <div className="w-full container-main bg-[rgb(var(--color-bg))] pb-32">

        {/* ================= BACK NAV (🔥 NEW) ================= */}
        <div className="sticky top-0 z-40 backdrop-blur bg-[rgb(var(--color-bg))]/90 border-b border-[rgb(var(--color-border))]">

          <div className="flex items-center gap-3 px-2 py-3">

            <Link
              href={`/campaign/${campaign.slug}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-soft))] transition"
            >
              <span className="text-[14px]">←</span>
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

        {/* ================= HEADER ================= */}
        <div className="section-tight space-y-3">

          <h1 className="h2 leading-tight">
            Doa untuk {campaign.title}
          </h1>

          <p className="caption max-w-lg">
            Ribuan orang telah mendoakan. Setiap doa adalah harapan
            yang menguatkan 💚 Kamu juga bisa ikut mengaminkan dan berbagi kebaikan.
          </p>

        </div>

        {/* ================= CONTENT ================= */}
        <CampaignPrayersSection
          campaignId={campaign.id}
          initialData={prayers}
          showHeader={false}
        />

      </div>
    </div>
  );
}