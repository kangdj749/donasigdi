import { getSheetsClient } from "./google-sheet-client";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

const RANGE = {
  CAMPAIGNS: "campaigns!A:K",
  CAMPAIGN_STORY: "campaign_story!A:G",
  DONATIONS: "donations!A:G",
  PRAYERS: "prayers!A:F",
};

/* ===============================
   GENERIC FETCH (READ)
================================ */

export async function fetchSheet<T extends Record<string, unknown>>(
  range: string
): Promise<T[]> {
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const rows = res.data.values ?? [];

  if (rows.length === 0) return [];

  const [headerRow, ...dataRows] = rows;

  const headers = headerRow.map((h) => String(h));

  return dataRows.map((row) => {
    const obj: Record<string, unknown> = {};

    headers.forEach((key, i) => {
      obj[key] = row[i] ?? "";
    });

    return obj as T;
  });
}


/* ===============================
   DONATION WRITE
================================ */

export async function appendDonation(
  row: (string | number)[]
) {
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: RANGE.DONATIONS,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}

async function findDonationRow(
  id: string
): Promise<number | null> {
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "donations!A2:A",
  });

  const rows = res.data.values ?? [];
  const idx = rows.findIndex((r) => r[0] === id);

  return idx === -1 ? null : idx + 2;
}

export async function updateDonationStatus(
  donationId: string,
  data: {
    payment_status?: string;
    midtrans_id?: string;
  }
) {
  const sheets = getSheetsClient();
  const row = await findDonationRow(donationId);
  if (!row) return;

  if (data.payment_status) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `donations!E${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[data.payment_status]] },
    });
  }

  if (data.midtrans_id) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `donations!F${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[data.midtrans_id]] },
    });
  }
}

export async function incrementCampaignCollected(
  campaignId: string,
  amount: number
) {
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE.CAMPAIGNS,
  });

  const rows = res.data.values ?? [];
  const [header, ...data] = rows;

  const idIndex = header.indexOf("id");
  const collectedIndex = header.indexOf("collected_amount");

  const idx = data.findIndex(
    (r) => r[idIndex] === campaignId
  );

  if (idx === -1) return;

  const rowNumber = idx + 2;
  const current = Number(
    data[idx][collectedIndex] || 0
  );
  const updated = current + amount;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `campaigns!${String.fromCharCode(
      65 + collectedIndex
    )}${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[updated]],
    },
  });
}

export { RANGE };
