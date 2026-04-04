import { NextResponse } from "next/server";
import { fetchSheet, RANGE } from "@/lib/google-sheet";
import { cloudinaryImage } from "@/lib/cloudinary";

/* =========================
   TYPES
========================= */

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

/* =========================
   GLOBAL CACHE 🔥
========================= */

type CacheData = {
  campaigns: Campaign[];
  stories: CampaignStory[];
};

type CacheEntry = {
  data: CacheData;
  expiry: number;
};

const CACHE_TTL = 60 * 1000; // 60 detik (aman banget buat quota)

let globalCache: CacheEntry | null = null;

/* =========================
   HELPERS
========================= */

function toNumber(val: string | number | undefined): number {
  const n = Number(String(val ?? "").replace(/[^\d]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

/* =========================
   FETCH WITH CACHE
========================= */

async function getCachedSheets(): Promise<CacheData> {
  const now = Date.now();

  // ✅ cache hit
  if (globalCache && now < globalCache.expiry) {
    return globalCache.data;
  }

  try {
    // ✅ single fetch (parallel)
    const [campaigns, stories] = await Promise.all([
      fetchSheet<Campaign>(RANGE.CAMPAIGNS),
      fetchSheet<CampaignStory>(RANGE.CAMPAIGN_STORY),
    ]);

    const data: CacheData = {
      campaigns: Array.isArray(campaigns) ? campaigns : [],
      stories: Array.isArray(stories) ? stories : [],
    };

    // ✅ save cache
    globalCache = {
      data,
      expiry: now + CACHE_TTL,
    };

    return data;
  } catch (err) {
    console.error("🔥 SHEETS FETCH ERROR:", err);

    // ✅ fallback pakai cache lama kalau ada
    if (globalCache) {
      return globalCache.data;
    }

    return {
      campaigns: [],
      stories: [],
    };
  }
}

/* =========================
   GET
========================= */

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { campaigns, stories } = await getCachedSheets();

    /* ================= FIND CAMPAIGN ================= */

    const campaign = campaigns.find(
      (c) =>
        String(c.slug) === params.slug &&
        String(c.status).toLowerCase() === "active"
    );

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    /* ================= STORIES ================= */

    const campaignStories = stories
      .filter((s) => String(s.campaign_id) === campaign.id)
      .sort(
        (a, b) =>
          Number(a.section_order || 0) -
          Number(b.section_order || 0)
      )
      .map((section) => ({
        ...section,
        image_url: section.image_public_id
          ? cloudinaryImage(section.image_public_id, 800)
          : null,
      }));

    /* ================= NUMBERS ================= */

    const goal = toNumber(campaign.goal_amount);
    const collected = toNumber(campaign.collected_amount);

    const percentage =
      goal > 0
        ? Math.min(Math.round((collected / goal) * 100), 100)
        : 0;

    /* ================= RESULT ================= */

    const result = {
      ...campaign,
      goal_amount: goal,
      collected_amount: collected,
      percentage,
      hero_image_url: cloudinaryImage(
        campaign.hero_image_public_id,
        800
      ),
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