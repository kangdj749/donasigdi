import { google } from "googleapis";

/* =========================================================
   CONFIG
========================================================= */

const SHEET_ID = process.env.GOOGLE_SHEET_ID as string;

if (!SHEET_ID) {
  throw new Error("GOOGLE_SHEET_ID not defined");
}

const DONATION_SHEET = "donations";
const CAMPAIGN_SHEET = "campaigns";

/* =========================================================
   AUTH
========================================================= */

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

/* =========================================================
   SIMPLE CACHE (ANTI QUOTA 🔥)
========================================================= */

const cache = new Map<string, { data: unknown; expiry: number }>();
const TTL = 60 * 1000;

function getCache<T>(key: string): T | null {
  const c = cache.get(key);
  if (!c) return null;

  if (Date.now() > c.expiry) {
    cache.delete(key);
    return null;
  }

  return c.data as T;
}

function setCache(key: string, data: unknown) {
  cache.set(key, {
    data,
    expiry: Date.now() + TTL,
  });
}

/* =========================================================
   TYPES (FIXED BASED ON YOUR SHEET)
========================================================= */

export interface AppendDonationPayload {
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
}

/* =========================================================
   APPEND DONATION (🔥 FIXED ORDER)
========================================================= */

export async function appendDonation(
  data: AppendDonationPayload
) {
  const values = [
    data.id,
    data.campaign_id,
    data.organization_id ?? "",
    data.affiliate_id ?? "",
    data.ref_code ?? "",

    data.donor_name,
    data.donor_contact ?? "",

    data.amount,
    data.commission_amount ?? "",

    data.payment_status,

    data.midtrans_id ?? "",
    data.snap_token ?? "",

    data.message ?? "",
    data.is_anonymous ? "TRUE" : "FALSE",

    data.created_at,

    data.ref ?? "",
    data.payment_method ?? "",
    data.fee ?? "",
    data.net_amount ?? "",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${DONATION_SHEET}!A:S`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

/* =========================================================
   FIND ROW (CACHED 🔥)
========================================================= */

async function findDonationRow(
  donationId: string
): Promise<number | null> {
  const cacheKey = "donation_ids";

  let rows = getCache<string[][]>(cacheKey);

  if (!rows) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${DONATION_SHEET}!A:A`,
    });

    rows = res.data.values ?? [];
    setCache(cacheKey, rows);
  }

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]?.toString() === donationId) {
      return i + 1;
    }
  }

  return null;
}

/* =========================================================
   UPDATE SNAP TOKEN
========================================================= */

export async function updateSnapToken(
  donationId: string,
  token: string
) {
  const row = await findDonationRow(donationId);
  if (!row) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${DONATION_SHEET}!L${row}`, // snap_token
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[token]],
    },
  });
}

/* =========================================================
   UPDATE DONATION STATUS (🔥 FIX EXPORT)
========================================================= */

export async function updateDonationStatus(
  donationId: string,
  payload: {
    payment_status?: string;
    midtrans_id?: string;
  }
) {
  const row = await findDonationRow(donationId);
  if (!row) return;

  const updates: Promise<unknown>[] = [];

  if (payload.payment_status) {
    updates.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${DONATION_SHEET}!J${row}`, // payment_status
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[payload.payment_status]],
        },
      })
    );
  }

  if (payload.midtrans_id) {
    updates.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${DONATION_SHEET}!K${row}`, // midtrans_id
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[payload.midtrans_id]],
        },
      })
    );
  }

  await Promise.all(updates);
}

/* =========================================================
   CAMPAIGN UPDATE (🔥 CRITICAL FIX)
========================================================= */

async function findCampaignRow(
  campaignId: string
): Promise<number | null> {
  const cacheKey = "campaign_ids";

  let rows = getCache<string[][]>(cacheKey);

  if (!rows) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CAMPAIGN_SHEET}!A:A`,
    });

    rows = res.data.values ?? [];
    setCache(cacheKey, rows);
  }

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]?.toString() === campaignId) {
      return i + 1;
    }
  }

  return null;
}

/* =========================================================
   INCREMENT CAMPAIGN (🔥 FIX TOTAL + DONOR)
========================================================= */

export async function incrementCampaignStats(
  campaignId: string,
  amount: number
) {
  const row = await findCampaignRow(campaignId);
  if (!row) return;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${CAMPAIGN_SHEET}!I${row}:J${row}`,
  });

  const currentAmount = Number(res.data.values?.[0]?.[0] ?? 0);
  const currentDonor = Number(res.data.values?.[0]?.[1] ?? 0);

  const updatedAmount = currentAmount + amount;
  const updatedDonor = currentDonor + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${CAMPAIGN_SHEET}!I${row}:J${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[updatedAmount, updatedDonor]],
    },
  });
}

export interface DonationRow {
  id: string;
  campaign_id: string;
  donor_name: string;
  amount: number;
  payment_status: string;
  message: string;
  is_anonymous: string | boolean;
}

export async function getDonationById(
  donationId: string
): Promise<DonationRow | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "donations!A:S",
  });

  const rows = res.data.values ?? [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === donationId) {
      return {
        id: rows[i][0],
        campaign_id: rows[i][1],
        donor_name: rows[i][5],
        amount: Number(rows[i][7]),
        payment_status: rows[i][9],
        message: rows[i][12],
        is_anonymous: rows[i][13],
      };
    }
  }

  return null;
}

export async function getCampaignByIdOrSlug(
  value: string
): Promise<{ id: string; organization_id?: string } | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "campaigns!A:C", // id, organization_id, slug
  });

  const rows = res.data.values ?? [];

  for (let i = 1; i < rows.length; i++) {
    const id = String(rows[i][0] ?? "").trim();
    const orgId = String(rows[i][1] ?? "").trim();
    const slug = String(rows[i][2] ?? "").trim();

    if (value === id || value === slug) {
      return {
        id,
        organization_id: orgId,
      };
    }
  }

  return null;
}