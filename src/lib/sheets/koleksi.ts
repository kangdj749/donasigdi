// lib/sheets/koleksi.ts

/* ===============================
   TYPES
================================ */


export type KoleksiSEO = {
  slug: string;
  h1: string;
  intro?: string;
  excerpt?: string;
  image?: string;
  faq_json?: string;
  product_category: string;
};

/* ===============================
   SHEET CONFIG
================================ */
const SHEET_ID = "1XW8fxroHC3Cw3jGLAW_qfeTOhGW9WVVK1QH_TrMsD-Q";
const TAB_KOLEKSI = "koleksi"; // pastikan nama tab BENAR

/* ===============================
   GET ALL KOLEKSI
================================ */
export async function getAllKoleksi(): Promise<KoleksiSEO[]> {
  try {
    const res = await fetch(
      `https://opensheet.elk.sh/${SHEET_ID}/${TAB_KOLEKSI}`,
      { cache: "no-store" }
    );

    if (!res.ok) return [];

    const rows = (await res.json()) as Record<string, string>[];

    if (!Array.isArray(rows)) return [];

    return rows
      .filter((r) => r.slug && r.h1)
      .map((r) => ({
        slug: r.slug.trim(),
        h1: r.h1.trim(),
        intro: r.intro || "",
        excerpt: r.excerpt || "",
        image: r.image || "",
        faq_json: r.faq_json || undefined,
        product_category: r.product_category || "",
      }));
  } catch (err) {
    console.error("❌ getAllKoleksi error:", err);
    return [];
  }
}

/* ===============================
   GET KOLEKSI BY SLUG
================================ */
export async function getKoleksiBySlug(
  slug: string
): Promise<KoleksiSEO | null> {
  const all = await getAllKoleksi();
  return all.find((k) => k.slug === slug) || null;
}
