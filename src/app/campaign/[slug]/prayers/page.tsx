import Link from "next/link";
import { notFound } from "next/navigation";

import { getCampaignBySlug } from "@/lib/campaign.service";
import {
  getViralPrayers,
  type Prayer,
} from "@/lib/campaign.extras.service";

import CampaignPrayersSection from "@/components/campaign/sections/CampaignPrayersSection";

/* ================= CONFIG ================= */

export const revalidate = 60;

/* ================= SEO META ================= */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) return {};

  const title = `Doa untuk ${campaign.title} | Aminkan & Bantu`;
  const description = `Kumpulan doa terbaik untuk ${campaign.title}. Aminkan doa dan bantu sekarang 🙏`;

  const url = `/campaign/${campaign.slug}/prayers`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ================= PAGE ================= */

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

  /* 🔥 JSON-LD */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Doa untuk ${campaign.title}`,
    description: `Kumpulan doa untuk ${campaign.title}`,
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] flex justify-center">
      <div className="w-full container-main bg-[rgb(var(--color-bg))] pb-32">

        {/* JSON LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />

        {/* NAV */}
        <div className="sticky top-0 z-40 backdrop-blur bg-[rgb(var(--color-bg))]/90 border-b border-[rgb(var(--color-border))]">
          <div className="flex items-center gap-3 px-2 py-3">

            <Link
              href={`/campaign/${campaign.slug}`}
              className="btn btn-outline"
            >
              ← Kembali
            </Link>

            <p className="caption truncate">
              {campaign.title}
            </p>

          </div>
        </div>

        {/* HEADER */}
        <div className="section-tight space-y-3">
          <h1 className="h2">
            Doa untuk {campaign.title}
          </h1>

          <p className="caption">
            Ribuan orang telah mendoakan. Kamu juga bisa ikut
            mengaminkan 🙏
          </p>
        </div>

        {/* CONTENT */}
        <CampaignPrayersSection
          campaignId={campaign.id}
          organizationId={campaign.organization_id}
          campaignSlug={campaign.slug}
          organizationSlug={campaign.organization?.slug ?? "" }
          initialData={prayers.map((p) => ({
            ...p,
            amen_count: Number(p.amen_count ?? 0),
            share_count: Number(p.share_count ?? 0),
            created_at: p.created_at ?? new Date().toISOString(),
          }))}
          
        />

      </div>
    </div>
  );
}