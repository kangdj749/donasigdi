import { fetchSheet, RANGE } from "./google-sheet";
import { setCache, getCache } from "./utils/cache";
/* =========================
   TYPES
========================= */

type RawCampaign = Record<string, string>;
type RawStory = Record<string, string>;

export type CampaignSectionType =
  | "heading"
  | "subheading"
  | "text"
  | "image"
  | "quote"
  | "list"
  | "video"
  | "highlight_box"
  | "divider"
  | "stats"
  | "card_grid"
  | "cta";

export type Campaign = {
  id: string;
  slug: string;
  title: string;
  short_tagline: string;
  category: string;
  hero_image_public_id: string;
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
  type: CampaignSectionType;
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
  slug: string,
  preview = false
): Promise<Campaign | null> {

  const cacheKey = `campaign:${slug}`;

  if (!preview) {
    const cached = getCache<Campaign>(cacheKey);
    if (cached) return cached;
  }

  const campaigns = await fetchSheet<RawCampaign>(RANGE.CAMPAIGNS);
  const stories = await fetchSheet<RawStory>(RANGE.CAMPAIGN_STORY);

  const rawCampaign = campaigns.find(
    (c) =>
      String(c.slug).trim() === slug &&
      String(c.status).trim().toLowerCase() === "active"
  );

  if (!rawCampaign) return null;

  /* =========================
     NORMALIZE CAMPAIGN
  ========================= */

  const campaign: Campaign = {
    id: String(rawCampaign.id).trim(),
    slug: String(rawCampaign.slug).trim(),
    title: String(rawCampaign.title ?? "").trim(),
    short_tagline: String(rawCampaign.short_tagline ?? "").trim(),
    category: String(rawCampaign.category ?? "")
    .trim()
    .toLowerCase(), // 👈 penting
    hero_image_public_id: String(
      rawCampaign.hero_image_public_id ?? ""
    ).trim(),
    hero_video_url: rawCampaign.hero_video_url
      ? String(rawCampaign.hero_video_url).trim()
      : undefined,
    goal_amount: toNumber(rawCampaign.goal_amount),
    collected_amount: toNumber(rawCampaign.collected_amount),
    status: String(rawCampaign.status ?? "").trim(),
    seo_title: rawCampaign.seo_title
      ? String(rawCampaign.seo_title).trim()
      : undefined,
    seo_description: rawCampaign.seo_description
      ? String(rawCampaign.seo_description).trim()
      : undefined,
    stories: [],
  };

  /* =========================
     NORMALIZE STORIES
  ========================= */

  const allowedTypes: CampaignSectionType[] = [
    "heading",
    "subheading",
    "text",
    "image",
    "quote",
    "list",
    "video",
    "highlight_box",
    "divider",
    "stats",
    "card_grid",
    "cta",
  ];

  const campaignStories: CampaignStorySection[] = stories
    .filter(
      (s) =>
        String(s.campaign_id).trim() === campaign.id
    )
    .map((s) => {
      const rawType = String(s.type ?? "")
        .trim()
        .toLowerCase();

      const safeType: CampaignSectionType =
        allowedTypes.includes(rawType as CampaignSectionType)
          ? (rawType as CampaignSectionType)
          : "text";

      return {
        id: String(s.id ?? "").trim(),
        campaign_id: String(s.campaign_id ?? "").trim(),
        type: safeType,
        content: s.content ? String(s.content).trim() : undefined,
        image_id: s.image_id ? String(s.image_id).trim() : undefined,
        video_url: s.video_url
          ? String(s.video_url).trim()
          : undefined,
        section_order: Number(s.section_order ?? 0),
      };
    })
    .sort((a, b) => a.section_order - b.section_order);

  campaign.stories = campaignStories;

    if (!preview) {
    setCache(cacheKey, campaign);
  }

  return campaign;
}

