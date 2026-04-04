import { fetchSheet, RANGE } from "./google-sheet";

/* ================= TYPES ================= */

type Row = Record<string, string | undefined>;

export type CampaignUpdate = {
  id: string;
  campaign_id: string;
  type: string;
  title: string;
  content: string;
  image_id: string;
  video_url: string;
  amount: number;
  created_at: string;
};

/* ================= HELPERS ================= */

function s(val?: string): string {
  return String(val ?? "").trim();
}

function toNumber(val?: string): number {
  const n = Number(val?.replace(/[^\d]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

function toDate(val?: string): number {
  return new Date(s(val)).getTime() || 0;
}

/* ================= CACHE ================= */

const cache = new Map<string, CampaignUpdate[]>();

export async function getCampaignUpdates(
  campaignId: string
): Promise<CampaignUpdate[]> {
  const key = `updates:${campaignId}`;

  if (cache.has(key)) return cache.get(key)!;

  const data = await fetchSheet<Row>("campaign_updates!A:J");

  const result = data
    .filter((r) => s(r.campaign_id) === campaignId)
    .sort((a, b) => toDate(b.created_at) - toDate(a.created_at))
    .map((r) => ({
      id: s(r.id),
      campaign_id: s(r.campaign_id),
      type: s(r.type),
      title: s(r.title),
      content: s(r.content),
      image_id: s(r.image_id),
      video_url: s(r.video_url),
      amount: toNumber(r.amount),
      created_at: s(r.created_at),
    }));

  cache.set(key, result);

  return result;
}