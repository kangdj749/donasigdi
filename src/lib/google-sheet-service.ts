import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const DONATION_SHEET_NAME = "donations";

if (!SHEET_ID) {
  throw new Error("GOOGLE_SHEET_ID not defined");
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

/* =========================================================
   TYPES
========================================================= */

export interface AppendDonationPayload {
  id: string;
  campaign_id: string;
  donor_name: string;
  donor_contact: string;
  amount: number;
  payment_status: string;
  midtrans_id?: string;
  snap_token?: string;
  message?: string;
  ref?: string;
  is_anonymous?: boolean;
}

/* =========================================================
   INTERNAL: FIND ROW (FIXED)
========================================================= */

async function findRowByDonationId(
  donationId: string
): Promise<number | null> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${DONATION_SHEET_NAME}!A:A`,
  });

  const rows = response.data.values;
  if (!rows) return null;

  // skip header (index 0)
  for (let i = 1; i < rows.length; i++) {
    const cellValue = rows[i][0]?.toString().trim();

    if (cellValue === donationId.trim()) {
      return i + 1; // sheet index starts at 1
    }
  }

  console.error("DONATION ID NOT FOUND:", donationId);
  return null;
}

/* =========================================================
   APPEND DONATION
========================================================= */

export async function appendDonation(data: AppendDonationPayload) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${DONATION_SHEET_NAME}!A:L`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        data.id,
        data.campaign_id,
        data.donor_name,
        data.donor_contact,
        Number(data.amount),
        data.payment_status,
        data.midtrans_id ?? "",
        data.snap_token ?? "",
        data.message ?? "",
        data.is_anonymous ? "TRUE" : "FALSE",
        new Date().toISOString(),
        data.ref ?? "",
      ]],
    },
  });
}

/* =========================================================
   UPDATE SNAP TOKEN (H column)
========================================================= */

export async function updateSnapToken(
  donationId: string,
  snapToken: string
) {
  const row = await findRowByDonationId(donationId);
  if (!row) {
    console.error("UPDATE SNAP TOKEN FAILED - ROW NOT FOUND");
    return;
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${DONATION_SHEET_NAME}!H${row}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[snapToken]],
    },
  });
}

/* =========================================================
   UPDATE PAYMENT STATUS
   F = payment_status
   G = midtrans_id
========================================================= */

export async function updatePaymentStatus(
  donationId: string,
  data: {
    payment_status?: string;
    midtrans_id?: string;
  }
) {
  const row = await findRowByDonationId(donationId);

  if (!row) {
    console.error("UPDATE PAYMENT FAILED - ROW NOT FOUND:", donationId);
    return;
  }

  if (data.payment_status !== undefined) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${DONATION_SHEET_NAME}!F${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[data.payment_status]],
      },
    });
  }

  if (data.midtrans_id !== undefined) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${DONATION_SHEET_NAME}!G${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[data.midtrans_id]],
      },
    });
  }
}
