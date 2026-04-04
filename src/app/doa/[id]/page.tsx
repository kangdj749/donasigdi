import { notFound } from "next/navigation";

import { getPrayerById } from "@/lib/campaign.extras.service";
import { getCampaignById } from "@/lib/campaign.service";

import PrayerShareButtons from "./PrayerShareButtons";
import PrayerCTAButton from "./PrayerCTAButton";

/* =========================
   HELPERS
========================= */

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

/* =========================
   SEO META
========================= */

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const prayer = await getPrayerById(params.id);

  if (!prayer) return {};

  const title = `Doa untuk ${
     "Kebaikan"
  }`;

  const description = prayer.message.slice(0, 140);

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

/* =========================
   PAGE
========================= */

export default async function PrayerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const prayer = await getPrayerById(params.id);
  if (!prayer) return notFound();

  const campaign = await getCampaignById(
    prayer.campaign_id
  );

  const formattedDate = formatDate(
    prayer.created_at
  );

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] flex justify-center">
      <div className="container-main bg-[rgb(var(--color-bg))] pb-32">

        {/* HEADER */}
        <div className="section-tight border-b border-[rgb(var(--color-border))] space-y-1">
          <p className="caption">
            Doa dari donatur 💚
          </p>

          {campaign && (
            <h1 className="h3 leading-tight">
              {campaign.title}
            </h1>
          )}
        </div>

        {/* CONTENT */}
        <div className="section space-y-6">

          {/* DOA */}
          <div className="card space-y-5 animate-fadeUp">
            <p className="body-lg leading-loose">
              “{prayer.message}”
            </p>

            <div className="flex justify-between items-center pt-3 border-t border-[rgb(var(--color-border))]">
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
            campaignSlug={campaign?.slug}
            campaignTitle={campaign?.title}
            prayerId={prayer.id}
          />

          {/* CTA */}
          {campaign && (
            <div className="card space-y-4 border border-[rgb(var(--color-primary))]/30 animate-fadeUp">

              <div className="space-y-1.5">
                <p className="caption text-[rgb(var(--color-primary))]">
                  Yuk bantu juga 🙏
                </p>

                <h2 className="h3">
                  {campaign.title}
                </h2>

                {campaign.short_tagline && (
                  <p className="caption text-[rgb(var(--color-muted))]">
                    {campaign.short_tagline}
                  </p>
                )}
              </div>

              <PrayerCTAButton
                campaignSlug={campaign.slug}
                prayerId={prayer.id}
              />
            </div>
          )}

          {/* SOCIAL PROOF */}
          <div className="text-center space-y-2 animate-fadeIn">
            <p className="caption">
              Setiap doa adalah harapan 💚
            </p>
            <p className="caption-subtle">
              Ribuan orang sudah membantu, kamu juga bisa 🙏
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}