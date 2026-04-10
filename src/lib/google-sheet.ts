import { getSheetsClient } from "./google-sheet-client";

/* =========================
   CONFIG
========================= */

const SHEET_ID = process.env.GOOGLE_SHEET_ID as string;

export const RANGE = {
  CAMPAIGNS: "campaigns!A:U",
  CAMPAIGN_STORY: "campaign_story!A:H",
  DONATIONS: "donations!A:W",
  PRAYERS: "prayers!A:M",
  UPDATES: "updates!A:E",
  DISBURSEMENTS: "disbursements!A:G",
  AMENS: "amens!A:D",
  ORGANIZATIONS: "organizations!A:J",
} as const;

/* =========================
   CACHE SYSTEM (🔥 CORE FIX)
========================= */

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const CACHE_TTL = 60 * 1000; // 1 menit
const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

/* =========================
   HELPERS
========================= */

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setCache<T>(key: string, data: T) {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL,
  });
}

function invalidateCache(key?: string) {
  if (!key) {
    cache.clear();
    return;
  }
  cache.delete(key);
}

/* =========================
   RETRY (ANTI 429)
========================= */

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    if (retries <= 0) throw err;

    const delay = (4 - retries) * 500; // exponential-ish
    await new Promise((r) => setTimeout(r, delay));

    return withRetry(fn, retries - 1);
  }
}

/* =========================
   FETCH SHEET (🔥 CORE)
========================= */

export async function fetchSheet<
  T extends Record<string, unknown>
>(range: string): Promise<T[]> {
  
  const cacheKey = `sheet:${SHEET_ID}:${range}`;

  /* ===== CACHE HIT ===== */
  const cached = getCache<T[]>(cacheKey);
  if (cached) return cached;

  /* ===== SINGLE FLIGHT ===== */
  if (inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey) as Promise<T[]>;
  }

  const promise = (async () => {
    const sheets = getSheetsClient();

    const res = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range,
      })
    );

    const rows = res.data.values ?? [];

    if (!rows.length) {
      setCache(cacheKey, []);
      return [];
    }

    const [headerRow, ...dataRows] = rows;

    const headers = headerRow.map((h) =>
      String(h)
        .replace(/\u00A0/g, "") // 🔥 remove NBSP
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
    );

    const result: T[] = dataRows.map((row) => {
      const obj: Record<string, unknown> = {};

      headers.forEach((key, i) => {
        obj[key] = row?.[i] ?? "";
      });

      return obj as T;
    });

    setCache(cacheKey, result);

    return result;
  })();

  inFlight.set(cacheKey, promise);

  try {
    return await promise;
  } finally {
    inFlight.delete(cacheKey);
  }
}

/* =========================
   APPEND ROW
========================= */

export async function appendSheetRow(
  range: string,
  values: (string | number)[]
): Promise<void> {
  const sheets = getSheetsClient();

  /* ================= NORMALIZE ================= */
  const normalized = values.map((v) =>
    v === null || v === undefined || v === "" ? " " : v
  );

  /* ================= GET LAST ROW ================= */
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const currentRows = res.data.values?.length || 0;
  const nextRow = currentRows + 1;

  const sheetName = range.split("!")[0];

  /* ================= WRITE EXACT ROW ================= */
  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A${nextRow}:M${nextRow}`, // 🔥 FIX UTAMA
      valueInputOption: "RAW",
      requestBody: {
        values: [normalized],
      },
    })
  );

  invalidateCache(`sheet:${range}`);
}

/* =========================
   UPDATE ROW (BY campaign_id)
========================= */

export async function updateSheetRow(
  range: string,
  campaignId: string,
  values: (string | number)[]
): Promise<void> {
  const sheets = getSheetsClient();

  const data = await fetchSheet<
    Record<string, string | number>
  >(range);

  const index = data.findIndex(
    (row) => String(row["campaign_id"]) === campaignId
  );

  if (index === -1) return;

  const rowNumber = index + 2;
  const sheetName = range.split("!")[0];

  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
      },
    })
  );

  invalidateCache(`sheet:${range}`);
}

/* =========================
   DONATION WRITE
========================= */

type DonationInput = {
  id: string;
  campaign_id: string;
  organization_id?: string;
  affiliate_id?: string;
  ref_code?: string;
  donor_name: string;
  donor_contact?: string;
  amount: number;
  commission_amount?: number;
  payment_status: string;
  midtrans_id?: string;
  snap_token?: string;
  message?: string;
  is_anonymous?: boolean;
  created_at: string;
  ref?: string;
  payment_method?: string;
  fee?: number;
  net_amount?: number;
};

export async function appendDonation(
  input: DonationInput
) {
  const values = [
    input.id,
    input.campaign_id,
    input.organization_id ?? "",
    input.affiliate_id ?? "",
    input.ref_code ?? "",
    input.donor_name,
    input.donor_contact ?? "",
    input.amount,
    input.commission_amount ?? "",
    input.payment_status,
    input.midtrans_id ?? "",
    input.snap_token ?? "",
    input.message ?? "",
    input.is_anonymous ? "TRUE" : "FALSE",
    input.created_at,
    input.ref ?? "",
    input.payment_method ?? "",
    input.fee ?? "",
    input.net_amount ?? "",
  ];

  await appendSheetRow(RANGE.DONATIONS, values);
}
/* =========================
   FIND DONATION ROW (CACHED)
========================= */

async function findDonationRow(
  id: string
): Promise<number | null> {
  const rows = await fetchSheet<Record<string, unknown>>(
    "donations!A2:A"
  );

  const idx = rows.findIndex(
    (r) => String(Object.values(r)[0]) === id
  );

  return idx === -1 ? null : idx + 2;
}

/* =========================
   UPDATE DONATION STATUS
========================= */

export async function updateDonationStatus(
  donationId: string,
  data: {
    payment_status?: string;
    midtrans_id?: string;
  }
) {
  const sheets = getSheetsClient();

  const all = await fetchSheet<Record<string, string>>(
    RANGE.DONATIONS
  );

  const index = all.findIndex(
    (row) => String(row.id) === donationId
  );

  if (index === -1) return;

  const rowNumber = index + 2;

  const header = Object.keys(all[0]);

  const paymentIndex = header.indexOf("payment_status");
  const midtransIndex = header.indexOf("midtrans_id");

  if (paymentIndex === -1 || midtransIndex === -1) {
    console.error("❌ Column not found");
    return;
  }

  const updates: Promise<unknown>[] = [];

  if (data.payment_status) {
    const col = String.fromCharCode(65 + paymentIndex);

    updates.push(
      withRetry(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `donations!${col}${rowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[data.payment_status]],
          },
        })
      )
    );
  }

  if (data.midtrans_id) {
    const col = String.fromCharCode(65 + midtransIndex);

    updates.push(
      withRetry(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `donations!${col}${rowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [[data.midtrans_id]],
          },
        })
      )
    );
  }

  await Promise.all(updates);

  invalidateCache(`sheet:${RANGE.DONATIONS}`);
}

/* =========================
   INCREMENT CAMPAIGN
========================= */

export async function incrementCampaignCollected(
  campaignId: string,
  amount: number
) {
  const data = await fetchSheet<Record<string, unknown>>(
    RANGE.CAMPAIGNS
  );

  if (!data.length) return;

  const header = Object.keys(data[0]);

  const idIndex = header.indexOf("id");
  const collectedIndex = header.indexOf("collected_amount");

  const idx = data.findIndex(
    (r) => String(Object.values(r)[idIndex]) === campaignId
  );

  if (idx === -1) return;

  const current = Number(
    Object.values(data[idx])[collectedIndex] || 0
  );

  const updated = current + amount;
  const rowNumber = idx + 2;

  const colLetter = String.fromCharCode(
    65 + collectedIndex
  );

  const sheets = getSheetsClient();

  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `campaigns!${colLetter}${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[updated]],
      },
    })
  );

  invalidateCache(`sheet:${RANGE.CAMPAIGNS}`);
}

export async function appendPrayerRow(values: string[]) {
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: "prayers!A:A",
  });

  const nextRow = (res.data.values?.length || 1) + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: `prayers!A${nextRow}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [values],
    },
  });
}