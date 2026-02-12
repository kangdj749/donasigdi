/* =========================
   DOMAIN / SSOT (TRANSAKSI)
========================= */

/**
 * 🔴 VARIANT DOMAIN
 * Dipakai untuk:
 * - cart
 * - stock lock / release
 * - checkout
 * - order
 */
export type ProductVariant = {
  variantId: string;
  productId: string; // 🔒 DIKUNCI: productId, BUKAN id

  variation1Name: string;
  variation1Value: string;

  variation2Name?: string;
  variation2Value?: string;

  price: number;
  discountPrice?: number | null;

  stock: number;
  varWeight?: number;
  image?: string;
};

/**
 * 🔴 PRODUCT DOMAIN
 */
export type Product = {
  productId: string; // 🔒 DIKUNCI: productId
  name: string;
  slug: string;
  description?: string;

  image: string;
  gallery?: string[];

  category?: string;
  tags?: string[];

  price?: number;
  discountPrice?: number | null;
  weight?: number;

  marketplace?: {
    shopee?: string;
    tokopedia?: string;
    tiktok?: string;
  };
};

/* =========================
   UI / VIEW MODELS
========================= */

/**
 * Variasi untuk UI selector
 */
export type ProductVariation = {
  name: string;
  options: string[];
};

/**
 * 🟢 VARIANT VIEW (UI ONLY)
 * ❗ TIDAK BOLEH MASUK CART / ORDER
 */
export type ProductVariantView = {
  variantId: string; // bridge ke domain

  /**
   * contoh:
   * { Warna: "Hitam", Ukuran: "L" }
   */
  optionMap: Record<string, string>;

  price: number;
  discountPrice?: number;
  stock: number;

  image?: string;
  weight?: number;
};

/**
 * 🟢 PRODUCT UNTUK UI
 */
export type ProductView = Product & {
  variations?: ProductVariation[];
  variants?: ProductVariantView[];
};
