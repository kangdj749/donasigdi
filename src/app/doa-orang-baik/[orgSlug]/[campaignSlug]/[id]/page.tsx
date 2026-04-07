import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPrayerById } from "@/lib/campaign.extras.service";
import { getCampaignById } from "@/lib/campaign.service";

import PrayerShareButtons from "./PrayerShareButtons";
import PrayerCTAButton from "./PrayerCTAButton";

/* ================= TYPES ================= */

type Params = {
  orgSlug: string;
  campaignSlug: string;
  id: string;
};

/* ================= HELPERS ================= */

function formatDate(date?: string): string {
  if (!date) return "";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function truncate(text: string, max = 140) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

/* ================= SEO ================= */

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const prayer = await getPrayerById(params.id);
  if (!prayer) return {};

  const campaign = await getCampaignById(prayer.campaign_id);

  const title = `Doa untuk ${campaign?.title ?? "Kebaikan"} 🙏`;
  const description = truncate(prayer.message);

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/doa-orang-baik/${params.orgSlug}/${params.campaignSlug}/${params.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
  };
}

/* ================= PAGE ================= */

export default async function PrayerDetailPage({
  params,
}: {
  params: Params;
}) {
  const prayer = await getPrayerById(params.id);
  if (!prayer) return notFound();

  const campaign = await getCampaignById(
    prayer.campaign_id
  );

  /* 🔥 VALIDASI SLUG (IMPORTANT) */
  if (
    campaign &&
    (campaign.slug !== params.campaignSlug ||
      campaign.organization?.slug !== params.orgSlug)
  ) {
    return notFound();
  }

  const formattedDate = formatDate(
    prayer.created_at
  );

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/doa-orang-baik/${params.orgSlug}/${params.campaignSlug}/${params.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Doa untuk ${campaign?.title ?? "Kebaikan"}`,
    description: truncate(prayer.message),
    author: {
      "@type": "Person",
      name: prayer.name || "Hamba Allah",
    },
    datePublished: prayer.created_at,
    mainEntityOfPage: pageUrl,
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] flex justify-center">
      <div className="container-main bg-[rgb(var(--color-bg))] pb-32">

        {/* JSON LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />

        {/* HEADER */}
        <div className="section-tight border-b border-[rgb(var(--color-border))] space-y-2">
          <p className="caption">
            🤲 Doa dari orang baik
          </p>

          {campaign && (
            <h1 className="h2 leading-tight">
              {campaign.title}
            </h1>
          )}
        </div>

        {/* CONTENT */}
        <div className="section space-y-6">

          <div className="card space-y-5 animate-fadeUp">
            <p className="body-lg leading-loose">
              “{prayer.message}”
            </p>

            <div className="flex justify-between pt-3 border-t">
              <span className="caption">
                {prayer.name || "Hamba Allah"}
              </span>

              {formattedDate && (
                <span className="caption-subtle">
                  {formattedDate}
                </span>
              )}
            </div>
          </div>

          {/* SHARE */}
          <PrayerShareButtons
            message={prayer.message}
            campaignSlug={params.campaignSlug}
            organizationSlug={params.orgSlug}
            campaignTitle={campaign?.title}
            prayerId={prayer.id}
          />

          {/* CTA */}
          {campaign && (
            <div className="card space-y-4 border border-primary/30">
              <h2 className="h3">
                {campaign.title}
              </h2>

              <PrayerCTAButton
                campaignSlug={campaign.slug}
                prayerId={prayer.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}