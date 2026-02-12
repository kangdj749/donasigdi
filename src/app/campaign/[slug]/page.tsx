import { getCampaignBySlug } from "@/lib/campaign.service";

import { notFound } from "next/navigation";

import CampaignStoryRenderer from "@/components/campaign/CampaignStoryRenderer";
import CampaignHero from "@/components/campaign/CampaignHero";
import CampaignProgress from "@/components/campaign/CampaignProgress";


export const revalidate = 60;

export default async function CampaignPage({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) return notFound();

  const collected = Number(campaign.collected_amount) || 0;
  const goal = Number(campaign.goal_amount) || 0;


  return (
    <div className="flex justify-center bg-gray-50">
  <div className="w-full max-w-md bg-white min-h-screen pb-32">

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
    {campaign.stories?.length > 0 && (
      <CampaignStoryRenderer sections={campaign.stories} />
    )}


        {/* ================= SECTION LINKS ================= */}
        <div className="px-4 pt-6 pb-10 border-t mt-8 space-y-4 text-sm">
          <a
            href={`/campaign/${campaign.slug}/kabar`}
            className="block font-medium"
          >
            📢 Kabar Terbaru →
          </a>

          <a
            href={`/campaign/${campaign.slug}/donatur`}
            className="block font-medium"
          >
            ❤️ Donatur →
          </a>

          <a
            href={`/campaign/${campaign.slug}/doa`}
            className="block font-medium"
          >
            🤲 Doa Orang Baik →
          </a>

          <a
            href={`/campaign/${campaign.slug}/pencairan`}
            className="block font-medium"
          >
            💰 Pencairan Dana →
          </a>
        </div>

        {/* ================= STICKY CTA ================= */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center bg-white border-t shadow-md">
          <div className="w-full max-w-md p-3">
            <button className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold active:scale-95 transition">
              Donasi Sekarang
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
