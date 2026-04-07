import { fetchSheet, RANGE } from "./google-sheet";
import { getSheetsClient } from "./google-sheet-client";
import { broadcast } from "@/lib/realtime.service";

/* ================= TYPES ================= */

type Counter = {
  amen: number;
  share: number;
};

type PrayerRow = Record<string, string>;

/* ================= MEMORY ================= */

const memory = new Map<string, Counter>();
const buffer = new Map<string, Counter>();

/* ================= HELPERS ================= */

function toNumber(v?: string) {
  const n = Number(v || 0);
  return Number.isNaN(n) ? 0 : n;
}

function getCounter(id: string): Counter {
  return memory.get(id) ?? { amen: 0, share: 0 };
}

/* ================= INCREMENT ================= */

export function incrementAmen(id: string) {
  const current = getCounter(id);

  const updated = {
    ...current,
    amen: current.amen + 1,
  };

  memory.set(id, updated);

  /* buffer */
  const b = buffer.get(id) ?? { amen: 0, share: 0 };
  b.amen += 1;
  buffer.set(id, b);

  /* realtime */
  broadcast({
    type: "amen",
    prayerId: id,
    value: updated.amen,
  });

  return updated.amen;
}

export function incrementShare(id: string) {
  const current = getCounter(id);

  const updated = {
    ...current,
    share: current.share + 1,
  };

  memory.set(id, updated);

  const b = buffer.get(id) ?? { amen: 0, share: 0 };
  b.share += 1;
  buffer.set(id, b);

  broadcast({
    type: "share",
    prayerId: id,
    value: updated.share,
  });

  return updated.share;
}

/* ================= FLUSH ================= */

let flushing = false;

export async function flushPrayers() {
  if (flushing || buffer.size === 0) return;

  flushing = true;

  try {
    const sheets = getSheetsClient();

    const rows = await fetchSheet<PrayerRow>(RANGE.PRAYERS);

    const indexMap = new Map<string, number>();

    rows.forEach((r, i) => {
      if (r.id) indexMap.set(r.id, i);
    });

    for (const [id, delta] of buffer) {
      const index = indexMap.get(id);
      if (index === undefined) continue;

      const row = rows[index];

      const amen =
        toNumber(row.amen_count) + delta.amen;

      const share =
        toNumber(row.share_count) + delta.share;

      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID!,
        range: `prayers!I${index + 2}:J${index + 2}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[amen, share]],
        },
      });
    }

    buffer.clear();
  } catch (err) {
    console.error("FLUSH ERROR:", err);
  } finally {
    flushing = false;
  }
}

/* AUTO FLUSH */
setInterval(() => {
  flushPrayers();
}, 10000);