import { fetchSheet, RANGE } from "./google-sheet";

/* ===============================
   GLOBAL CACHE (SMART TTL)
================================ */

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setCache<T>(
  key: string,
  data: T,
  ttl = 60_000
) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
}

/* ===============================
   BASE TYPES
================================ */

type SheetRow = Record<string, string | undefined>;

/* ===============================
   HELPERS (SAFE & REUSABLE)
================================ */

function s(val?: string): string {
  return String(val ?? "").trim();
}

function toNumber(val?: string): number {
  if (!val) return 0;
  const n = Number(val.replace(/[^\d]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

function toDate(val?: string): number {
  return new Date(s(val)).getTime() || 0;
}

/* ===============================
   SHARED FETCH (🔥 CORE OPTIMIZATION)
================================ */

async function getSheetCached<T extends SheetRow>(
  key: string,
  range: string,
  ttl = 60_000
): Promise<T[]> {
  const cached = getCache<T[]>(key);
  if (cached) return cached;

  try {
    const data = await fetchSheet<T>(range);
    const safe = Array.isArray(data) ? data : [];

    setCache(key, safe, ttl);

    return safe;
  } catch (err) {
    console.error("🔥 SHEET FETCH ERROR:", err);

    if (cached) return cached;

    return [];
  }
}

/* ===============================
   TYPES (UI SAFE)
================================ */

export type Donor = {
  id: string;
  name: string;
  amount: number;
  payment_status: string;
  message?: string;
  is_anonymous?: boolean;
  created_at?: string;
};

export type UpdateItem = {
  id: string;
  title: string;
  content: string;
  created_at?: string;
};

export type Prayer = {
  id: string;
  campaign_id: string;
  name: string;
  message: string;
  target_name: string;
  amen_count: number;
  share_count: number; // 🔥 WAJIB
  viral_score: number; // 🔥 NEW
  created_at?: string;
};

export type Disbursement = {
  id: string;
  amount: number;
  description: string;
  date: string;
};

/* ===============================
   MAPPERS (🔥 REUSABLE CORE)
================================ */

function mapPrayer(row: SheetRow): Prayer {
  return {
    id: s(row.id),
    campaign_id: s(row.campaign_id),
    name: s(row.name) || "Hamba Allah",
    message: s(row.message),
    target_name: s(row.target_name),
    amen_count: toNumber(row.amen_count),
    share_count: toNumber(row.share_count), // 🔥 FIX
    viral_score: computeViralScore(row), // 🔥
    created_at: s(row.created_at),
  };
}

/* ===============================
   DONORS
================================ */

/* ===============================
   DONORS (ENTERPRISE SAFE)
================================ */

function mapDonor(row: SheetRow): Donor {
  const isAnon =
    s(row.is_anonymous).toLowerCase() === "true";

  return {
    id: s(row.id),

    name: isAnon
      ? "Hamba Allah"
      : s(row.donor_name) || "Hamba Allah",

    amount: toNumber(row.amount),

    payment_status: s(row.payment_status) || "unknown",

    message: s(row.message),

    is_anonymous: isAnon,

    created_at: s(row.created_at),
  };
}

export async function getRecentDonors(
  campaignId: string
): Promise<Donor[]> {
  const data = await getSheetCached<SheetRow>(
    "DONATIONS",
    RANGE.DONATIONS,
    60_000
  );

  return data
    .filter((d) => {
      const cid = s(d.campaign_id);
      const status = s(d.payment_status).toLowerCase();

      return cid === String(campaignId) && status === "paid";
    })
    .sort((a, b) => toDate(b.created_at) - toDate(a.created_at))
    .slice(0, 50)
    .map((d): Donor => {
      const isAnon =
        s(d.is_anonymous).toLowerCase() === "true";

      return {
        id: s(d.id),

        name: isAnon
          ? "Hamba Allah"
          : s(d.donor_name) || "Hamba Allah",

        amount: toNumber(d.amount),

        payment_status: s(d.payment_status),

        message: s(d.message),

        is_anonymous: isAnon,

        created_at: s(d.created_at),
      };
    });
}
/* ===============================
   UPDATES
================================ */

export async function getRecentUpdates(
  campaignId: string
): Promise<UpdateItem[]> {
  const data = await getSheetCached<SheetRow>(
    "UPDATES",
    RANGE.UPDATES
  );

  return data
    .filter((u) => s(u.campaign_id) === campaignId)
    .sort((a, b) => toDate(b.created_at) - toDate(a.created_at))
    .slice(0, 5)
    .map((u) => ({
      id: s(u.id),
      title: s(u.title),
      content: s(u.content),
      created_at: s(u.created_at),
    }));
}

/* ===============================
   PRAYERS (LIST)
================================ */

export async function getRecentPrayers(
  campaignId: string
): Promise<Prayer[]> {
  const data = await getSheetCached<SheetRow>(
    "PRAYERS",
    RANGE.PRAYERS
  );

  return data
    .filter((p) => s(p.campaign_id) === campaignId)
    .sort((a, b) => toDate(b.created_at) - toDate(a.created_at))
    .slice(0, 10)
    .map(mapPrayer);
}

/* ===============================
   🔥 GET PRAYER BY ID (NEW - CORE FEATURE)
================================ */

export async function getPrayerById(
  id: string
): Promise<Prayer | null> {
  if (!id) return null;

  const data = await getSheetCached<SheetRow>(
    "PRAYERS",
    RANGE.PRAYERS,
    60_000 // bisa dinaikin ke 2–5 menit nanti
  );

  const found = data.find((p) => s(p.id) === id);

  if (!found) return null;

  return mapPrayer(found);
}

/* ===============================
   DISBURSEMENTS
================================ */

export async function getRecentDisbursements(
  campaignId: string
): Promise<Disbursement[]> {
  const data = await getSheetCached<SheetRow>(
    "DISBURSEMENTS",
    RANGE.DISBURSEMENTS
  );

  return data
    .filter((d) => s(d.campaign_id) === campaignId)
    .sort((a, b) => toDate(b.date) - toDate(a.date))
    .slice(0, 5)
    .map((d) => ({
      id: s(d.id),
      amount: toNumber(d.amount),
      description: s(d.description),
      date: s(d.date),
    }));
}

/* ===============================
   TRUST STATS
================================ */

export async function getCampaignTrustStats(
  campaignId: string
): Promise<{
  totalDonors: number;
  totalAmount: number;
}> {
  const data = await getSheetCached<SheetRow>(
    "DONATIONS",
    RANGE.DONATIONS
  );

  const paid = data.filter(
    (d) =>
      s(d.campaign_id) === campaignId &&
      s(d.payment_status).toLowerCase() === "paid"
  );

  return {
    totalDonors: paid.length,
    totalAmount: paid.reduce(
      (sum, d) => sum + toNumber(d.amount),
      0
    ),
  };
}

function computeViralScore(row: SheetRow): number {
  const amen = toNumber(row.amen_count);
  const share = toNumber(row.share_count);
  const created = toDate(row.created_at);

  const now = Date.now();

  const ageHours = (now - created) / (1000 * 60 * 60);

  // 🔥 decay: makin lama makin turun
  const recencyBoost = Math.max(0, 48 - ageHours); // max 48 jam boost

  return amen * 2 + share * 3 + recencyBoost;
}

export async function getViralPrayers(
  campaignId: string
): Promise<Prayer[]> {
  const data = await getSheetCached<SheetRow>(
    "PRAYERS",
    RANGE.PRAYERS,
    60_000
  );

  return data
    .filter((p) => s(p.campaign_id) === campaignId)
    .map(mapPrayer)
    .sort((a, b) => b.viral_score - a.viral_score)
    .slice(0, 50); // limit aman
}