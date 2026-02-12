import { google } from "googleapis";

function getClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function getVariantStock(params: {
  productId: string;
  variation1Name?: string;
  variation1Value?: string;
  variation2Name?: string;
  variation2Value?: string;
}): Promise<number> {
  const sheets = getClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: "product_variations!A2:I",
  });

  const rows = res.data.values ?? [];

  const row = rows.find((r) => {
    if (r[0] !== params.productId) return false;
    if (params.variation1Name && r[1] !== params.variation1Name) return false;
    if (params.variation1Value && r[2] !== params.variation1Value) return false;
    if (params.variation2Name && r[3] !== params.variation2Name) return false;
    if (params.variation2Value && r[4] !== params.variation2Value) return false;
    return true;
  });

  return Number(row?.[7] ?? 0); // kolom H = stock
}
