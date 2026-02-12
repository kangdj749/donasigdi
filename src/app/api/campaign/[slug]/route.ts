import { NextResponse } from "next/server";
import { fetchSheet, RANGE } from "@/lib/google-sheet";
import { cloudinaryImage } from "@/lib/cloudinary";

type Campaign = {
  id: string;
  slug: string;
  title: string;
  short_tagline: string;
  hero_image_public_id: string;
  goal_amount: string;
  collected_amount: string;
  status: string;
  seo_title: string;
  seo_description: string;
};

type CampaignStory = {
  id: string;
  campaign_id: string;
  section_order: string;
  type: "text" | "image";
  content: string;
  image_public_id: string;
};

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const campaigns = await fetchSheet<Campaign>(RANGE.CAMPAIGNS);
    const stories = await fetchSheet<CampaignStory>(RANGE.CAMPAIGN_STORY);


    const campaign = campaigns.find(
      (c) =>
        c.slug === params.slug &&
        c.status === "active"
    );

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    const campaignStories = stories
      .filter((s) => s.campaign_id === campaign.id)
      .sort(
        (a, b) =>
          Number(a.section_order) -
          Number(b.section_order)
      )
      .map((section) => ({
        ...section,
        image_url: section.image_public_id
          ? cloudinaryImage(section.image_public_id, 800)
          : null,
      }));

    const goal = Number(campaign.goal_amount || 0);
    const collected = Number(campaign.collected_amount || 0);

    const percentage =
      goal > 0
        ? Math.min(Math.round((collected / goal) * 100), 100)
        : 0;

    const result = {
      ...campaign,
      goal_amount: goal,
      collected_amount: collected,
      percentage,
      hero_image_url: cloudinaryImage(
        campaign.hero_image_public_id,
        800),
      stories: campaignStories,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Campaign detail error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
