/* =============================
   TYPES
============================= */
export type CategorySEO = {
  slug: string;
  name: string;
  seo_title?: string;
  seo_description?: string;
  seo_content?: string;
  faq_json?: string;
};

type SheetRow = [
  string,
  string,
  string?,
  string?,
  string?,
  string?
];

/* =============================
   CACHE (MODULE LEVEL)
============================= */
let cachedRows: SheetRow[] | null = null;
let lastFetch = 0;
let hasWarned = false; // 🔥 prevent spam log

const TTL = 1000 * 60 * 60; // 1 jam

/* =============================
   FETCH SHEET ROWS (SAFE)
============================= */
async function fetchCategoryRows(): Promise<SheetRow[]> {
  const now = Date.now();

  if (cachedRows && now - lastFetch < TTL) {
    return cachedRows;
  }

  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const API_KEY = process.env.GOOGLE_SHEET_API_KEY;

  // ⛔ ENV NOT READY → silent fail
  if (!SHEET_ID || !API_KEY) {
    if (!hasWarned) {
      console.warn("⚠️ categories_seo env belum diset");
      hasWarned = true;
    }
    return cachedRows ?? [];
  }

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/categories_seo?key=${API_KEY}`,
      {
        cache: "force-cache",
      }
    );

    if (!res.ok) {
      if (!hasWarned) {
        console.warn("⚠️ categories_seo sheet gagal diambil");
        hasWarned = true;
      }
      return cachedRows ?? [];
    }

    const data = await res.json();

    cachedRows = (data.values?.slice(1) || []) as SheetRow[];
    lastFetch = now;

    return cachedRows;
  } catch (err) {
    if (!hasWarned) {
      console.warn("⚠️ categories_seo fetch error");
      hasWarned = true;
    }
    return cachedRows ?? [];
  }
}

/* =============================
   SINGLE CATEGORY (SAFE)
============================= */
export async function getCategorySEO(slug: string) {
  if (!slug) return null;

  const rows = await fetchCategoryRows();

  const row = rows.find(
    (r) => typeof r[0] === "string" && r[0] === slug
  );

  if (!row) return null;

  return {
    slug: row[0],
    name: row[1],
    seo_title: row[2],
    seo_description: row[3],
    seo_content: row[4],
    faq_json: row[5],
  } satisfies CategorySEO;
}

/* =============================
   ALL CATEGORIES (SAFE)
============================= */
export async function getAllCategorySEO(): Promise<CategorySEO[]> {
  const rows = await fetchCategoryRows();

  return rows
    .filter(
      (r): r is SheetRow =>
        typeof r[0] === "string" && typeof r[1] === "string"
    )
    .map((row) => ({
      slug: row[0],
      name: row[1],
      seo_title: row[2],
      seo_description: row[3],
      seo_content: row[4],
      faq_json: row[5],
    }));
}
