import { fetchSheet, RANGE } from "./google-sheet";
import { getSheetsClient } from "./google-sheet-client";
import { broadcast } from "@/lib/realtime.service";

/* ================= TYPES ================= */

type PrayerRow = Record<string, unknown> & {
  id: string;
  share_count?: string | number;
};

/* ================= MEMORY (OPTIMISTIC UI) ================= */

const memoryShare = new Map<string, number>();

/* ================= QUEUE ================= */

const shareQueue = new Map<string, number>();

let isFlushing = false;

const FLUSH_INTERVAL = 5000;
const MAX_BATCH = 50;

/* ================= HELPERS ================= */

function toNumber(val: unknown): number {
  const n = Number(String(val ?? "").replace(/[^\d]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

/* ================= 🔥 MAIN ENTRY ================= */

export function incrementPrayerShare(prayerId: string) {
  /* ================= MEMORY ================= */
  const currentMemory = memoryShare.get(prayerId) || 0;
  const updatedMemory = currentMemory + 1;

  memoryShare.set(prayerId, updatedMemory);

  /* ================= QUEUE ================= */
  const currentQueue = shareQueue.get(prayerId) || 0;
  shareQueue.set(prayerId, currentQueue + 1);

  /* ================= REALTIME ================= */
  broadcast({
    type: "share_update",
    prayerId,
    total: updatedMemory,
  });

  /* ================= BACKGROUND FLUSH ================= */
  triggerFlush();

  return updatedMemory;
}

/* ================= FLUSH ================= */

function triggerFlush() {
  if (isFlushing) return;

  setTimeout(() => {
    flushQueue().catch((err) => {
      console.error("🔥 FLUSH ERROR:", err);
    });
  }, FLUSH_INTERVAL);
}

async function flushQueue() {
  if (isFlushing) return;
  if (shareQueue.size === 0) return;

  isFlushing = true;

  try {
    const sheets = getSheetsClient();

    /* ================= COPY QUEUE ================= */
    const entries = Array.from(shareQueue.entries()).slice(0, MAX_BATCH);

    entries.forEach(([id]) => {
      shareQueue.delete(id);
    });

    /* ================= FETCH ONCE ================= */
    const prayers = await fetchSheet<PrayerRow>(RANGE.PRAYERS);

    if (!prayers.length) return;

    const headers = Object.keys(prayers[0]);

    const idIndex = headers.indexOf("id");
    const shareIndex = headers.indexOf("share_count");

    if (idIndex === -1 || shareIndex === -1) {
      console.error("❌ share_count column not found");
      return;
    }

    const colLetter = String.fromCharCode(65 + shareIndex);

    /* ================= UPDATE LOOP ================= */
    for (const [prayerId, increment] of entries) {
      const index = prayers.findIndex(
        (p) =>
          String(Object.values(p)[idIndex]) === String(prayerId)
      );

      if (index === -1) continue;

      const rowNumber = index + 2;

      const current = toNumber(
        Object.values(prayers[index])[shareIndex]
      );

      const updated = current + increment;

      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID!,
        range: `prayers!${colLetter}${rowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[updated]],
        },
      });
    }

    console.log(`✅ FLUSH SUCCESS: ${entries.length}`);
  } catch (err) {
    console.error("🔥 BATCH UPDATE ERROR:", err);
  } finally {
    isFlushing = false;

    if (shareQueue.size > 0) {
      triggerFlush();
    }
  }
}