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

export async function getProductVariantById(variantId: string) {
  const sheets = getClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: "variants!A2:Z",
  });

  const rows = res.data.values ?? [];

  const row = rows.find((r) => r[0] === variantId);
  if (!row) return null;

  return {
    variantId: row[0],
    stock: Number(row[5] ?? 0), // sesuaikan index kolom
    price: Number(row[6] ?? 0),
    discountPrice: row[7] ? Number(row[7]) : undefined,
  };
}
