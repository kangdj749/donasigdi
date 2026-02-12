import { fetchSheet, RANGE } from "./google-sheet";

/* =========================
   TYPES
========================= */

type RawCampaign = Record<string, string>;
type RawStory = Record<string, string>;


export type Campaign = {
  id: string;
  slug: string;
  title: string;
  short_tagline: string;
  hero_image_public_id: string; // sekarang FULL URL
  hero_video_url?: string;
  goal_amount: number;
  collected_amount: number;
  status: string;
  seo_title?: string;
  seo_description?: string;
  stories: CampaignStorySection[];
};

export type CampaignStorySection = {
  id: string;
  campaign_id: string;
  type:
    | "heading"
    | "subheading"
    | "text"
    | "image"
    | "quote"
    | "list"
    | "video";
  content?: string;
  image_id?: string;
  video_url?: string;
  section_order: number;
};


/* =========================
   HELPERS
========================= */

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;

  const str = String(value).replace(/[^\d]/g, "");
  const num = Number(str);

  return Number.isNaN(num) ? 0 : num;
}

/* =========================
   MAIN SERVICE
========================= */

export async function getCampaignBySlug(
  slug: string
): Promise<Campaign | null> {
  const campaigns = await fetchSheet<RawCampaign>(RANGE.CAMPAIGNS);
  const stories = await fetchSheet<RawStory>(RANGE.CAMPAIGN_STORY);


  const rawCampaign = campaigns.find(
  (c) => String(c.slug) === slug && String(c.status) === "active"
);


  if (!rawCampaign) return null;

  /* =========================
     NORMALIZE CAMPAIGN
  ========================= */

  const campaign: Campaign = {
    id: String(rawCampaign.id),
    slug: String(rawCampaign.slug),
    title: String(rawCampaign.title),
    short_tagline: String(rawCampaign.short_tagline),
    hero_image_public_id: String(rawCampaign.hero_image_public_id ?? ""),
    hero_video_url: rawCampaign.hero_video_url
      ? String(rawCampaign.hero_video_url)
      : undefined,
    goal_amount: toNumber(rawCampaign.goal_amount),
    collected_amount: toNumber(rawCampaign.collected_amount),
    status: String(rawCampaign.status),
    seo_title: rawCampaign.seo_title
      ? String(rawCampaign.seo_title)
      : undefined,
    seo_description: rawCampaign.seo_description
      ? String(rawCampaign.seo_description)
      : undefined,
    stories: [],
  };


  /* =========================
     NORMALIZE STORIES
  ========================= */

  const allowedTypes: CampaignStorySection["type"][] = [
  "heading",
  "subheading",
  "text",
  "image",
  "quote",
  "list",
  "video",
];

const campaignStories: CampaignStorySection[] = stories
  .filter((s) => String(s.campaign_id) === String(campaign.id))
  .map((s) => {
    const rawType = String(s.type ?? "")
      .trim()
      .toLowerCase();

    const safeType: CampaignStorySection["type"] =
      allowedTypes.includes(rawType as CampaignStorySection["type"])
        ? (rawType as CampaignStorySection["type"])
        : "text";

    return {
      id: String(s.id ?? ""),
      campaign_id: String(s.campaign_id ?? ""),
      type: safeType,
      content: String(s.content ?? ""),
      image_id: String(s.image_id ?? ""),
      video_url: String(s.video_url ?? ""),
      section_order: Number(s.section_order ?? 0),
    };
  })
  .sort((a, b) => a.section_order - b.section_order);

  campaign.stories = campaignStories;

  return campaign;
}
