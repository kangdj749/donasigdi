import { fetchSheet, RANGE } from "./google-sheet";
import { getSheetsClient } from "./google-sheet-client";
import { broadcast } from "@/lib/realtime.service"; // ✅ FIX
import { queueAmen } from "./amen.flush";


/* ================= TYPES ================= */

type PrayerRow = Record<string, unknown> & {
  id: string;
  amen_count?: string | number;
};

/* ================= MEMORY STORE ================= */

// 🔥 simpan BASE dari sheet + increment realtime
const memoryAmen = new Map<string, number>();

/* ================= HELPERS ================= */

function toNumber(val: unknown): number {
  const n = Number(String(val ?? "").replace(/[^\d]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

/* ================= LOCAL INCREMENT (REALTIME) ================= */

export function incrementLocalAmen(prayerId: string) {
  queueAmen(prayerId); // tetap push ke queue

  const current = memoryAmen.get(prayerId) || 0;
  const updated = current + 1;

  memoryAmen.set(prayerId, updated);

  /* 🔥 REALTIME BROADCAST */
  broadcast({
    type: "amen_update",
    prayerId,
    total: updated,
  });

  return updated;
}

/* ================= QUEUE SYSTEM ================= */

const amenQueue = new Map<string, number>();

let isFlushing = false;

const FLUSH_INTERVAL = 5000;
const MAX_BATCH = 50;

/* ================= PUBLIC ================= */

export async function incrementPrayerAmen(
  prayerId: string
): Promise<number> {
  const current = amenQueue.get(prayerId) || 0;

  amenQueue.set(prayerId, current + 1);

  triggerFlush();

  return current + 1;
}

/* ================= FLUSH ================= */

function triggerFlush() {
  if (isFlushing) return;

  setTimeout(() => {
    flushQueue().catch(console.error);
  }, FLUSH_INTERVAL);
}

async function flushQueue() {
  if (isFlushing) return;
  if (amenQueue.size === 0) return;

  isFlushing = true;

  try {
    const sheets = getSheetsClient();

    /* ================= COPY QUEUE ================= */
    const entries = Array.from(amenQueue.entries()).slice(
      0,
      MAX_BATCH
    );

    entries.forEach(([id]) => amenQueue.delete(id));

    /* ================= FETCH ONCE ================= */
    const prayers = await fetchSheet<PrayerRow>(
      RANGE.PRAYERS
    );

    /* ================= MAP FOR FAST LOOKUP ================= */
    const indexMap = new Map<string, number>();

    prayers.forEach((p, i) => {
      indexMap.set(String(p.id), i);
    });

    /* ================= UPDATE LOOP ================= */
    for (const [prayerId, increment] of entries) {
      const index = indexMap.get(String(prayerId));
      if (index === undefined) continue;

      const rowNumber = index + 2;

      const base = toNumber(prayers[index].amen_count);

      const memory = memoryAmen.get(prayerId) || 0;

      // 🔥 gunakan nilai terbesar (anti overwrite bug)
      const current = Math.max(base, memory);

      const updated = current + increment;

      /* update memory juga */
      memoryAmen.set(prayerId, updated);

      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID!,
        range: `prayers!G${rowNumber}`, // ✅ kolom amen_count
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[updated]],
        },
      });
    }

    console.log(
      `✅ AMEN FLUSH SUCCESS: ${entries.length}`
    );
  } catch (err) {
    console.error("🔥 AMEN FLUSH ERROR:", err);
  } finally {
    isFlushing = false;

    if (amenQueue.size > 0) {
      triggerFlush();
    }
  }
}