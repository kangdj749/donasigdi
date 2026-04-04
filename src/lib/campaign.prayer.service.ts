import { fetchSheet, RANGE } from "./google-sheet";
import { getSheetsClient } from "./google-sheet-client";

/* ================= HELPERS ================= */

function s(val?: string) {
  return String(val ?? "").trim();
}

/* ================= INCREMENT SHARE ================= */

export async function incrementPrayerShare(
  prayerId: string
): Promise<number> {
  const sheets = getSheetsClient();

  const data = await fetchSheet<Record<string, string>>(
    RANGE.PRAYERS
  );

  const index = data.findIndex(
    (p) => s(p.id) === prayerId
  );

  if (index === -1) return 0;

  const rowNumber = index + 2;

  const current = Number(
    s(data[index].share_count) || "0"
  );

  const next = current + 1;

  // 🔥 share_count column (H → index 7)
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: `prayers!H${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[next]],
    },
  });

  return next;
}