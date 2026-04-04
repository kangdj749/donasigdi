import { getSheetsClient } from "./google-sheet-client";
import { fetchSheet, RANGE } from "./google-sheet";

/* =========================
   TYPES
========================= */

type PrayerRow = Record<string, string | number | undefined>;



const shareQueue = new Map<string, number>();

export function queueShare(prayerId: string) {
  shareQueue.set(prayerId, (shareQueue.get(prayerId) || 0) + 1);
}

/* =========================
   LOCK (ANTI DOUBLE FLUSH)
========================= */

let isFlushing = false;

/* =========================
   FLUSH FUNCTION
========================= */

async function flushToSheet() {
  if (shareQueue.size === 0) return;
  if (isFlushing) return;

  isFlushing = true;

  try {
    const sheets = getSheetsClient();

    /* 🔥 ambil semua prayers SEKALI */
    const prayers = await fetchSheet<PrayerRow>(RANGE.PRAYERS);

    if (!Array.isArray(prayers) || prayers.length === 0) {
      return;
    }

    /* 🔥 build index biar cepat */
    const indexMap = new Map<string, number>();

    prayers.forEach((p, i) => {
      const id = String(p.id ?? "");
      if (id) indexMap.set(id, i);
    });

    /* 🔥 proses queue */
    for (const [prayerId, increment] of shareQueue.entries()) {
      const idx = indexMap.get(prayerId);

      if (idx === undefined) continue;

      const rowNumber = idx + 2; // header offset

      const current = Number(
        prayers[idx].share_count ?? 0
      );

      const updated = current + increment;

      /* 🔥 UPDATE (1 row per prayer, bukan per klik) */
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID!,
        range: `prayers!H${rowNumber}`, // kolom share_count
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[updated]],
        },
      });
    }

    /* 🔥 clear queue setelah sukses */
    shareQueue.clear();

  } catch (err) {
    console.error("🔥 FLUSH ERROR:", err);
  } finally {
    isFlushing = false;
  }
}

/* =========================
   AUTO FLUSH (10 DETIK)
========================= */

setInterval(() => {
  flushToSheet();
}, 10000);