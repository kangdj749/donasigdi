import { getCampaignBySlug } from "@/lib/campaign.service";
import { notFound } from "next/navigation";
import CampaignStoryRenderer from "@/components/campaign/CampaignStoryRenderer";
import CampaignHero from "@/components/campaign/CampaignHero";
import CampaignProgress from "@/components/campaign/CampaignProgress";
import CampaignStorySkeleton from "@/components/campaign/CampaignStorySkeleton";

import { cookies } from "next/headers";

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
  searchParams?: { ref?: string };
}

export default async function CampaignPage({
  params,
  searchParams,
}: PageProps) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) return notFound();

  const collected = Number(campaign.collected_amount) || 0;
  const goal = Number(campaign.goal_amount) || 0;

  // ===============================
  // AFFILIATE SYSTEM (SCALABLE)
  // ===============================
  const cookieStore = cookies();
  const existingRef = cookieStore.get("campaign_ref")?.value;
  const incomingRef = searchParams?.ref;

  let affiliateCode = existingRef || null;

  if (incomingRef) {
    cookieStore.set("campaign_ref", incomingRef, {
      maxAge: 60 * 60 * 24 * 30, // 30 hari
      path: "/",
    });
    affiliateCode = incomingRef;
  }

  const donateUrl = affiliateCode
    ? `/donasi/${campaign.slug}?ref=${affiliateCode}`
    : `/donasi/${campaign.slug}`;

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="flex justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white min-h-screen pb-32 shadow-sm">

        {/* HERO */}
        <CampaignHero
          title={campaign.title}
          image={campaign.hero_image_public_id}
          videoUrl={campaign.hero_video_url}
        />

        <div className="p-4 space-y-6">

          {/* TITLE */}
          <div>
            <h1 className="text-xl font-bold leading-snug">
              {campaign.title}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {campaign.short_tagline}
            </p>
          </div>

          {/* PROGRESS */}
          <CampaignProgress
            collected={collected}
            goal={goal}
          />

        </div>

        {/* STORY */}
        <div className="px-4 pb-8">
          {campaign.stories?.length > 0 ? (
            <CampaignStoryRenderer sections={campaign.stories} />
          ) : (
            <CampaignStorySkeleton />
          )}
        </div>

        {/* ================= LINKS SECTION ================= */}
        <div className="px-4 pt-6 pb-10 border-t mt-8 space-y-4 text-sm bg-gray-50">
          <a
            href={`/campaign/${campaign.slug}/kabar`}
            className="block font-medium hover:underline"
          >
            📢 Kabar Terbaru →
          </a>

          <a
            href={`/campaign/${campaign.slug}/donatur`}
            className="block font-medium hover:underline"
          >
            ❤️ Donatur →
          </a>

          <a
            href={`/campaign/${campaign.slug}/doa`}
            className="block font-medium hover:underline"
          >
            🤲 Doa Orang Baik →
          </a>

          <a
            href={`/campaign/${campaign.slug}/pencairan`}
            className="block font-medium hover:underline"
          >
            💰 Pencairan Dana →
          </a>
        </div>

        {/* ================= STICKY DONATE CTA ================= */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center backdrop-blur-md bg-white/80 border-t">
          <div className="w-full max-w-md p-3">
            <a href={donateUrl}>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold active:scale-95 transition-all duration-200 shadow-lg">
                Donasi Sekarang
              </button>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
