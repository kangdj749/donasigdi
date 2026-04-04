import { getSheetsClient } from "./google-sheet-client";
import { fetchSheet, RANGE } from "./google-sheet";

/* =========================
   TYPES
========================= */

type PrayerRow = Record<string, string | number | undefined>;

/* =========================
   QUEUE (IN MEMORY)
========================= */

const queue = new Map<string, number>();

export function queueAmen(prayerId: string) {
  queue.set(prayerId, (queue.get(prayerId) || 0) + 1);
}

/* =========================
   LOCK (ANTI DOUBLE FLUSH)
========================= */

let isFlushing = false;

/* =========================
   FLUSH FUNCTION
========================= */

async function flushToSheet() {
  if (queue.size === 0) return;
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
    for (const [prayerId, increment] of queue.entries()) {
      const idx = indexMap.get(prayerId);

      if (idx === undefined) continue;

      const rowNumber = idx + 2; // header offset

      const current = Number(
        prayers[idx].amen_count ?? 0
      );

      const updated = current + increment;

      /* 🔥 UPDATE (1 row per prayer, bukan per klik) */
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID!,
        range: `prayers!G${rowNumber}`, // kolom amen_count
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[updated]],
        },
      });
    }

    /* 🔥 clear queue setelah sukses */
    queue.clear();

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