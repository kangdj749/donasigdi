import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { getCampaignBySlug } from "@/lib/campaign.service";
import {
  getRecentDonors,
  getRecentPrayers,
  getCampaignTrustStats,
  type Prayer,
} from "@/lib/campaign.extras.service";

import { getCampaignUpdates } from "@/lib/campaign.updates.service";

import CampaignHero from "@/components/campaign/CampaignHero";
import CampaignProgress from "@/components/campaign/CampaignProgress";
import CampaignStoryRenderer from "@/components/campaign/CampaignStoryRenderer";
import CampaignStorySkeleton from "@/components/campaign/CampaignStorySkeleton";
import DonationSection from "./DonationSection";

import CampaignTrustBlock from "@/components/campaign/CampaignTrustBlock";
import CampaignTabs from "@/components/campaign/CampaignTabs";
import AffiliateShareBox from "@/components/campaign/AffiliateShareBox";
import CampaignUpdatesTimeline from "@/components/campaign/CampaignUpdatesTimeline";

/* ================= CONFIG ================= */

export const revalidate = 60;

/* ================= HELPERS ================= */

function safeDate(date?: string | null): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value?: number | null): string {
  return (value ?? 0).toLocaleString("id-ID");
}

async function safeFetch<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

/* ================= PAGE ================= */

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { ref?: string };
}) {
  const campaign = await safeFetch(
    () => getCampaignBySlug(params.slug),
    null
  );

  if (!campaign) return notFound();

  const [donors, prayers, trustStats, updates] =
    await Promise.all([
      safeFetch(() => getRecentDonors(campaign.id), []),
      safeFetch(() => getRecentPrayers(campaign.id), []),
      safeFetch(() => getCampaignTrustStats(campaign.id), {
        totalDonors: 0,
        totalAmount: 0,
      }),
      safeFetch(() => getCampaignUpdates(campaign.id), []),
    ]);

  /* ================= AFFILIATE ================= */

  let affiliateCode: string | null = null;

  try {
    const cookieStore = cookies();

    affiliateCode =
      searchParams?.ref ??
      cookieStore.get("campaign_ref")?.value ??
      null;
  } catch {
    affiliateCode = searchParams?.ref ?? null;
  }

  const topPrayers = prayers.slice(0, 3);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] flex justify-center">
      <div className="w-full container-main bg-[rgb(var(--color-bg))] pb-32">

        {/* HERO */}
        <CampaignHero
          title={campaign.title}
          image={campaign.hero_image_public_id}
          videoUrl={campaign.hero_video_url}
        />

        {/* HEADER */}
        <div className="section space-y-6">

          <div className="space-y-2">
            <h1 className="h1">{campaign.title}</h1>
            <p className="caption">{campaign.short_tagline}</p>
          </div>

          <CampaignTrustBlock
            name={campaign.organization?.name || "Penggalang Dana"}
            logo={campaign.organization?.logo}
            verified={campaign.organization?.verified}
            totalDonors={trustStats.totalDonors}
          />

          {/* PROGRESS */}
          <div className="card space-y-4">

            <div className="flex justify-between">
              <span className="caption">
                {trustStats.totalDonors} donatur
              </span>

              <span className="body font-semibold text-primary">
                Rp {formatCurrency(trustStats.totalAmount)}
              </span>
            </div>

            <CampaignProgress
              slug={campaign.slug}
              initialCollected={campaign.collected_amount}
              goal_amount={campaign.goal_amount}
            />
          </div>

          {/* AFFILIATE BADGE */}
          {affiliateCode && (
            <div className="px-3 py-2 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-soft))] text-center">
              <span className="caption">
                Dibagikan relawan 💚 #{affiliateCode.slice(0, 6)}
              </span>
            </div>
          )}

        </div>

        {/* ================= TABS ================= */}
        <CampaignTabs
          slug={campaign.slug}
          prayersCount={prayers.length}

          donors={
            <div className="space-y-3">
              {donors.length === 0 && (
                <p className="caption text-center">
                  Belum ada donatur 🙏
                </p>
              )}

              {donors.map((d) => (
                <div
                  key={d.id}
                  className="card flex justify-between"
                >
                  <span className="body">
                    {d.name || "Hamba Allah"}
                  </span>

                  <span className="body font-semibold text-primary">
                    Rp {formatCurrency(d.amount)}
                  </span>
                </div>
              ))}
            </div>
          }

          updates={
            updates.length > 0 ? (
              <CampaignUpdatesTimeline updates={updates} />
            ) : (
              <p className="caption text-center">
                Belum ada kabar terbaru
              </p>
            )
          }
        />

        {/* ================= STORY ================= */}
        <div className="section-tight">
          <div className="card space-y-4">

            <h2 className="h3">Cerita Penggalangan</h2>

            {campaign.stories?.length ? (
              <CampaignStoryRenderer sections={campaign.stories} />
            ) : (
              <CampaignStorySkeleton />
            )}

          </div>
        </div>

        {/* ================= LATEST UPDATES PREVIEW ================= */}
        {updates.length > 0 && (
          <div className="section-tight space-y-4">

            <div className="flex items-center justify-between">
              <h2 className="h3">Kabar Terbaru 📢</h2>

              <Link
                href={`/campaign/${campaign.slug}/updates`}
                className="caption text-primary font-medium"
              >
                Lihat semua
              </Link>
            </div>

            <div className="space-y-3">
              {updates.slice(0, 2).map((u) => (
                <div key={u.id} className="card space-y-2">

                  <div className="flex justify-between items-center">
                    <p className="body font-medium">{u.title}</p>

                    <span className="caption-subtle">
                      {safeDate(u.created_at)}
                    </span>
                  </div>

                  <p className="caption line-clamp-2">
                    {u.content}
                  </p>

                </div>
              ))}
            </div>

          </div>
        )}    
        {/* ================= PRAYERS ================= */}
        <div className="section-tight space-y-4">

          <div className="flex justify-between">
            <h2 className="h3">Doa Orang Baik 🤲</h2>

            <Link
              href={`/campaign/${campaign.slug}/prayers`}
              className="caption text-primary"
            >
              Lihat semua
            </Link>
          </div>

          {topPrayers.length === 0 && (
            <p className="caption text-center">
              Belum ada doa 🙏
            </p>
          )}

          {topPrayers.map((p) => (
            <div key={p.id} className="card space-y-3">

              <div className="flex justify-between">
                <span className="body font-medium">
                  {p.name || "Hamba Allah"}
                </span>

                <span className="caption-subtle">
                  {safeDate(p.created_at)}
                </span>
              </div>

              <p className="body">{p.message}</p>

            </div>
          ))}

        </div>

        {/* SHARE */}
        <div className="section">
          <AffiliateShareBox
            campaignSlug={campaign.slug}
            campaignTitle={campaign.title}
            referralCode={affiliateCode}
          />
        </div>

        {/* CTA */}
        <DonationSection
          campaignId={campaign.id}
          affiliateCode={affiliateCode}
        />

      </div>
    </div>
  );
}