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
  organization_id: string;

  campaign_slug: string;
  organization_slug: string;

  name: string;
  message: string;
  target_name: string;

  amen_count: number;
  share_count: number;

  ref: string;
  src: string;

  created_at: string;
};

/* ================= CONFIG ================= */

const TTL = 60 * 1000; // 60s cache
const MAX_ROWS = 50; // limit response

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
    organization_id: s(raw.organization_id),

    campaign_slug: s(raw.campaign_slug),
    organization_slug: s(raw.organization_slug),

    name: s(raw.name) || "Hamba Allah",
    message: s(raw.message),
    target_name: s(raw.target_name),

    amen_count: toNumber(raw.amen_count),
    share_count: toNumber(raw.share_count),

    ref: s(raw.ref),
    src: s(raw.src),

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

/* ================= CLEANUP ================= */

function cleanupCache() {
  const now = Date.now();

  for (const [key, entry] of cache.entries()) {
    if (entry.expiry < now) {
      cache.delete(key);
    }
  }
}

/* ================= GET ================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const campaignId = s(searchParams.get("campaign_id"));
    const organizationId = s(
      searchParams.get("organization_id")
    );

    if (!campaignId || !organizationId) {
      return NextResponse.json([]);
    }

    const cacheKey =
      `PRAYERS_${organizationId}_${campaignId}`;

    cleanupCache();

    /* ================= CACHE HIT ================= */

    const cached = cache.get(cacheKey);

    if (cached && Date.now() < cached.expiry) {
      return NextResponse.json(cached.data);
    }

    /* ================= INFLIGHT ================= */

    if (inflight.has(cacheKey)) {
      const data = await inflight.get(cacheKey)!;
      return NextResponse.json(data);
    }

    /* ================= FETCH ================= */

    const promise = (async () => {
      try {
        const rows =
          await fetchSheet<RawPrayer>(
            RANGE.PRAYERS
          );

        const list = rows
          .map(normalizePrayer)
          .filter(
            (p) =>
              p.campaign_id === campaignId &&
              p.organization_id ===
                organizationId
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, MAX_ROWS);

        cache.set(cacheKey, {
          data: list,
          expiry: Date.now() + TTL,
        });

        return list;
      } catch (err) {
        console.error(
          "PRAYERS FETCH ERROR:",
          err
        );

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
        "Cache-Control":
          "s-maxage=60, stale-while-revalidate=120",
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
    const organizationId = s(body.organization_id);
    const message = s(body.message);

    if (!campaignId || !organizationId || !message) {
      return NextResponse.json(
        { error: "invalid payload" },
        { status: 400 }
      );
    }

    if (message.length < 5) {
      return NextResponse.json(
        { error: "message too short" },
        { status: 400 }
      );
    }

    const newPrayer: Prayer = {
      id: `PR-${Date.now()}`,

      campaign_id: campaignId,
      organization_id: organizationId,

      campaign_slug: s(body.campaign_slug),
      organization_slug: s(body.organization_slug),

      name: s(body.name) || "Hamba Allah",
      message,
      target_name: s(body.target_name),

      amen_count: 0,
      share_count: 0,

      ref: s(body.ref),
      src: s(body.src),

      created_at: new Date().toISOString(),
    };

    await appendSheetRow(RANGE.PRAYERS, [
      newPrayer.id,
      newPrayer.campaign_id,
      newPrayer.organization_id,
      newPrayer.organization_slug,
      newPrayer.campaign_slug,
      newPrayer.name,
      newPrayer.message,
      newPrayer.target_name,
      newPrayer.amen_count,
      newPrayer.share_count,
      newPrayer.ref,
      newPrayer.src,
      newPrayer.created_at,
    ]);

    /* ================= INVALIDATE CACHE ================= */

    cache.delete(
      `PRAYERS_${organizationId}_${campaignId}`
    );

    return NextResponse.json(newPrayer);
  } catch (err) {
    console.error("POST PRAYER ERROR:", err);

    return NextResponse.json(
      { error: "failed to create prayer" },
      { status: 500 }
    );
  }
}