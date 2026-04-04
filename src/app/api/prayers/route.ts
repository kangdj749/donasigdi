import { NextResponse } from "next/server";
import {
  fetchSheet,
  appendSheetRow,
  RANGE,
} from "@/lib/google-sheet";

/* ================= TYPES ================= */

type RawPrayer = Record<string, string | number | undefined>;

type Prayer = {
  id: string;
  campaign_id: string;
  name: string;
  message: string;
  target_name: string;
  amen_count: number;
  share_count: number;
  created_at: string;
};

/* ================= HELPERS ================= */

function s(val: unknown): string {
  return String(val ?? "").trim();
}

function toNumber(val: unknown): number {
  const n = Number(String(val ?? "").replace(/[^\d]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

function normalizePrayer(raw: RawPrayer): Prayer {
  return {
    id: s(raw.id),
    campaign_id: s(raw.campaign_id),
    name: s(raw.name) || "Hamba Allah",
    message: s(raw.message),
    target_name: s(raw.target_name),
    amen_count: toNumber(raw.amen_count),
    share_count: toNumber(raw.share_count),
    created_at: s(raw.created_at),
  };
}

/* ================= CACHE ================= */

type CacheEntry = {
  data: Prayer[];
  expiry: number;
};

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<Prayer[]>>();

const TTL = 30 * 1000;

/* ================= GET ================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = s(searchParams.get("campaign_id"));

    if (!campaignId) {
      return NextResponse.json([]);
    }

    const cacheKey = `PRAYERS_${campaignId}`;

    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return NextResponse.json(cached.data);
    }

    if (inflight.has(cacheKey)) {
      const data = await inflight.get(cacheKey)!;
      return NextResponse.json(data);
    }

    const promise = (async () => {
      try {
        const rows = await fetchSheet<RawPrayer>(RANGE.PRAYERS);

        const list = rows
          .map(normalizePrayer)
          .filter((p) => p.campaign_id === campaignId)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

        cache.set(cacheKey, {
          data: list,
          expiry: Date.now() + TTL,
        });

        return list;
      } catch (err) {
        console.error("🔥 PRAYERS FETCH ERROR:", err);

        if (cached) return cached.data;

        return [];
      } finally {
        inflight.delete(cacheKey);
      }
    })();

    inflight.set(cacheKey, promise);

    const result = await promise;

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("PRAYERS API ERROR:", err);
    return NextResponse.json([]);
  }
}

/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const campaignId = s(body.campaign_id);

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaign_id required" },
        { status: 400 }
      );
    }

    const newPrayer: Prayer = {
      id: Date.now().toString(),
      campaign_id: campaignId,
      name: s(body.name) || "Hamba Allah",
      message: s(body.message),
      target_name: s(body.target_name),
      amen_count: 0,
      share_count: 0,
      created_at: new Date().toISOString(),
    };

    await appendSheetRow(RANGE.PRAYERS, [
      newPrayer.id,
      newPrayer.campaign_id,
      "",
      newPrayer.name,
      newPrayer.message,
      newPrayer.target_name,
      newPrayer.amen_count,
      newPrayer.share_count,
      newPrayer.created_at,
    ]);

    cache.delete(`PRAYERS_${campaignId}`);

    return NextResponse.json(newPrayer);
  } catch (err) {
    console.error("POST PRAYER ERROR:", err);

    return NextResponse.json(
      { error: "failed to create prayer" },
      { status: 500 }
    );
  }
}