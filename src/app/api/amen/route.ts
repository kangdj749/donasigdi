import { NextResponse } from "next/server";
import { incrementPrayerAmen } from "@/lib/campaign.amen.service";

/* ================= RATE LIMIT ================= */

type RateLimitEntry = {
  count: number;
  lastHit: number;
};

const RATE_LIMIT_WINDOW = 3000;
const RATE_LIMIT_MAX = 3;

const rateMap = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry) {
    rateMap.set(ip, { count: 1, lastHit: now });
    return false;
  }

  if (now - entry.lastHit > RATE_LIMIT_WINDOW) {
    rateMap.set(ip, { count: 1, lastHit: now });
    return false;
  }

  entry.count += 1;
  entry.lastHit = now;

  return entry.count > RATE_LIMIT_MAX;
}

/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prayerId = String(body?.prayerId ?? "").trim();

    if (!prayerId) {
      return NextResponse.json(
        { error: "Invalid prayerId" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const total = await incrementPrayerAmen(prayerId);

    return NextResponse.json(
      {
        success: true,
        total: Number(total || 0),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("🔥 AMEN API ERROR:", err);

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}