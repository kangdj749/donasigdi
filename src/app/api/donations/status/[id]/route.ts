import { NextResponse } from "next/server";
import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const DONATION_SHEET_NAME = "donations";
const CAMPAIGN_SHEET_NAME = "campaigns";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const donationId = params.id;

    /* ================= GET DONATION ================= */

    const donationRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${DONATION_SHEET_NAME}!A:Z`,
    });

    const donationRows = donationRes.data.values;
    if (!donationRows)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const donation = donationRows.find(
      (row) => row[0]?.toString().trim() === donationId.trim()
    );

    if (!donation)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    /*
      ASUMSI STRUKTUR SHEET DONATIONS:
      0 = id
      1 = campaign_slug
      2 = donor_name
      4 = amount
      5 = payment_status
      6 = bank
      7 = va_number
      8 = message
      9 = expiry_time
      10 = created_at
    */

    const campaignId = donation[1];

    /* ================= GET CAMPAIGN ================= */

    const campaignRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${CAMPAIGN_SHEET_NAME}!A:Z`,
    });

    const campaignRows = campaignRes.data.values;

    let campaignData = null;

    if (campaignRows) {
      const campaign = campaignRows.find(
        (row) => row[0]?.toString().trim() === campaignId
      );

      if (campaign) {
        campaignData = {
          title: campaign[3],
          collected_amount: Number(campaign[9] || 0),
          target_amount: Number(campaign[8] || 0),
        };
      }
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      payment_status: donation[5] || "pending",
      amount: Number(donation[4] || 0),
      va_number: donation[7] || null,
      bank: donation[6] || null,
      expiry_time: donation[9] || null,
      campaign: campaignData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
