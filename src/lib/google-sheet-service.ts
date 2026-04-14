import { google } from "googleapis";
import { fetchSheet } from "@/lib/google-sheet";

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
  organization_slug?: string;
  campaign_slug?: string;
  src?: string;

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
    data.organization_slug ?? "",
    data.campaign_slug ?? "",
    data.src ?? "",
    
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${DONATION_SHEET}!A:V`,
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
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "campaigns!A:U",
  });

  const rows = res.data.values ?? [];
  if (rows.length < 2) return;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(campaignId)) {
      // 🔥 FIX: gunakan index langsung (lebih aman)
      const currentAmount = Number(rows[i][9] || 0);  // collected_amount
      const currentDonor = Number(rows[i][10] || 0); // donor_count

      const updatedAmount = currentAmount + amount;
      const updatedDonor = currentDonor + 1;

      const rowNumber = i + 1; // 🔥 FIX (bukan +2)

      console.log("📊 UPDATE ROW:", {
        rowNumber,
        updatedAmount,
        updatedDonor,
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `campaigns!J${rowNumber}:K${rowNumber}`, // 🔥 kolom FIX
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[updatedAmount, updatedDonor]],
        },
      });

      return;
    }
  }
}

export interface DonationRow {
  id: string;
  campaign_id: string;
  organization_id: string;
  donor_name: string;
  amount: number;
  payment_status: string;
  message: string;
  is_anonymous: string | boolean;
  ref: string;
  payment_method: string;
  organization_slug: string;
  campaign_slug: string;
  src: string;
}


export async function getDonationById(
  donationId: string
): Promise<DonationRow | null> {
  const rows = await fetchSheet<Record<string, string>>(
    "donations!A:V"
  );

  const found = rows.find((r) => r.id === donationId);

  if (!found) return null;

  return {
    id: found.id,
    campaign_id: found.campaign_id,
    organization_id: found.organization_id,

    donor_name: found.donor_name,
    amount: Number(found.amount || 0),
    payment_status: found.payment_status,
    message: found.message,
    is_anonymous: found.is_anonymous,

    ref: found.ref,
    payment_method: found.payment_method,

    organization_slug: found.organization_slug,
    campaign_slug: found.campaign_slug,
    src: found.src,
  };
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

export async function getAffiliateByRefCode(refCode: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "affiliates!A:I",
  });

  const rows = res.data.values ?? [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][5] === refCode) {
      return {
        id: rows[i][0],
        organization_id: rows[i][1],
        name: rows[i][2],
      };
    }
  }

  return null;
}

export async function getDonationRaw(
  donationId: string
) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "donations!A:W",
  });

  const rows = res.data.values ?? [];
  if (rows.length < 2) return null;

  const headers = rows[0].map((h) =>
    String(h).toLowerCase().trim()
  );

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === donationId) {
      const row = rows[i];

      const get = (key: string, fallbackIndex: number) => {
        const idx = headers.indexOf(key);
        if (idx !== -1 && row[idx]) return row[idx];
        return row[fallbackIndex] ?? "";
      };

      return {
        id: get("id", 0),
        campaign_id: get("campaign_id", 1),
        organization_id: get("organization_id", 2),

        donor_name: get("donor_name", 5),
        donor_contact: get("donor_contact", 6),
        amount: Number(get("amount", 7)),
        payment_status: get("payment_status", 9),

        message: get("message", 12),
        is_anonymous: get("is_anonymous", 13),

        ref: get("ref", 15),
        payment_method: get("payment_method", 16),

        organization_slug: get("organization_slug", 19),
        campaign_slug: get("campaign_slug", 20),
        src: get("src", 21),
        prayer_created: get("prayer_created", 21),
      };

    }
  }

  return null;
}
