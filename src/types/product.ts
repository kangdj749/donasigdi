/**
 * Product (LEVEL ATAS)
 * - Tidak punya stock
 * - Tidak dipakai transaksi
 */
export type Product = {
  productId: string;
  name: string;
  slug: string;
  description?: string;

  image: string;
  gallery?: string[];

  category?: string;
  tags?: string[];

  /**
   * DEFAULT price (fallback)
   */
  price?: number;
  discountPrice?: number | null;

  /**
   * DEFAULT weight (gram)
   */
  weight?: number;

  marketplace?: {
    shopee?: string;
    tokopedia?: string;
    tiktok?: string;
  };

  createdAt?: string;
};

/**
 * 🔴 SSOT TRANSAKSI
 */
export type ProductVariant = {
  variantId: string;
  productId: string;

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
 * ADMIN PAYLOAD (SUDAH TERBUKTI BENAR)
 */
export type AdminCreateProductPayload = {
  product: {
    name: string;
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

  variants: Array<{
    variantId: string;
    variation1Name: string;
    variation1Value: string;
    variation2Name?: string;
    variation2Value?: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    varWeight?: number;
    image?: string;
  }>;
};
