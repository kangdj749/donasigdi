import { NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const DONATION_SHEET_NAME = "donations";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const donationId = params.id;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${DONATION_SHEET_NAME}!A:L`,
  });

  const rows = response.data.values;
  if (!rows) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const donation = rows.find(
    (row) => row[0]?.toString().trim() === donationId.trim()
  );

  if (!donation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: donation[0],
    donor_name: donation[2],
    amount: donation[4],
    payment_status: donation[5],
    message: donation[8],
    created_at: donation[10],
  });
}
