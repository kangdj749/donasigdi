import { notFound } from "next/navigation";
import Link from "next/link";

import { getCampaignBySlug } from "@/lib/campaign.service";

import CampaignStoryRenderer from "@/components/campaign/CampaignStoryRenderer";
import CampaignStorySkeleton from "@/components/campaign/CampaignStorySkeleton";

/* =========================
   CONFIG
========================= */

export const revalidate = 60;

/* =========================
   SEO META
========================= */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) return {};

  const title = `Cerita ${campaign.title}`;
  const description = `Baca cerita lengkap tentang ${campaign.title}, latar belakang, dan tujuan penggalangan dana ini.`;

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

export default async function CampaignStoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) return notFound();

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] flex justify-center">

      <div className="w-full container-main bg-[rgb(var(--color-bg))] pb-32">

        {/* ================= HEADER ================= */}
        <div className="sticky top-0 z-30 backdrop-blur bg-[rgb(var(--color-bg))]/90 border-b border-[rgb(var(--color-border))]">

          <div className="flex items-center gap-3 px-4 py-3">

            {/* BACK */}
            <Link
              href={`/campaign/${campaign.slug}`}
              className="btn btn-outline"
            >
              ← Kembali
            </Link>

            {/* TITLE */}
            <div className="flex-1 min-w-0">
              <p className="caption-subtle">
                Cerita Campaign
              </p>
              <h1 className="body font-semibold truncate">
                {campaign.title}
              </h1>
            </div>

          </div>
        </div>

        {/* ================= HERO TEXT ================= */}
        <div className="section-tight space-y-3 border-b border-[rgb(var(--color-border))]">

          <h2 className="h2">
            Cerita Lengkap 💚
          </h2>

          <p className="caption max-w-md">
            Pahami latar belakang, kondisi, dan tujuan dari campaign ini secara menyeluruh.
          </p>

        </div>

        {/* ================= STORY ================= */}
        <div className="section">

          {campaign.stories?.length ? (
            <CampaignStoryRenderer
              sections={campaign.stories}
            />
          ) : (
            <CampaignStorySkeleton />
          )}

        </div>

      </div>
    </div>
  );
}