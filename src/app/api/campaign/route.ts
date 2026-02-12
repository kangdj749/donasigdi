import { NextResponse } from "next/server";
import { fetchSheet } from "@/lib/google-sheet";
import { cloudinaryImage } from "@/lib/cloudinary";

type CampaignRow = {
  id: string;
  slug: string;
  title: string;
  short_tagline: string;
  hero_image_public_id: string; // full secure_url
  goal_amount: string;
  collected_amount: string;
  status: string;
  seo_title: string;
  seo_description: string;
};

function toNumber(value?: string): number {
  if (!value) return 0;
  return Number(value.toString().replace(/[^\d]/g, "")) || 0;
}

export async function GET() {
  try {
    const campaigns =
      await fetchSheet<CampaignRow>("campaigns");

    const activeCampaigns = campaigns
      .filter((c) => c.status === "active")
      .map((c) => {
        const goal = toNumber(c.goal_amount);
        const collected = toNumber(c.collected_amount);

        const percentage =
          goal > 0
            ? Math.min(
                Math.round((collected / goal) * 100),
                100
              )
            : 0;

        return {
          id: c.id,
          slug: c.slug,
          title: c.title,
          short_tagline: c.short_tagline,
          goal_amount: goal,
          collected_amount: collected,
          percentage,
          hero_image_url: cloudinaryImage(
            c.hero_image_public_id,
            600
          ),
        };
      })
      .sort(
        (a, b) =>
          b.collected_amount - a.collected_amount
      );

    return NextResponse.json(activeCampaigns);
  } catch (error) {
    console.error("Campaign list error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
