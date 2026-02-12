import type { Product, ProductVariant } from "@/types/product";
import { slugify } from "@/lib/slugify";

/* ===============================
   CONFIG
================================ */
const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const TAB_PRODUCTS = "products";
const TAB_VARIANTS = "product_variations";

/* ===============================
   SHEET ROW TYPES (RAW)
================================ */
type SheetProductRow = {
  productId?: string;
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  gallery?: string;
  category?: string;
  tags?: string;
  price?: string | number;
  discountPrice?: string | number;
  weight?: string | number;
  shopee?: string;
  tokopedia?: string;
  tiktok?: string;
  createdAt?: string;
};

type SheetVariantRow = {
  variantId?: string;
  productId?: string;
  variation1Name?: string;
  variation1Value?: string;
  variation2Name?: string;
  variation2Value?: string;
  price?: string | number;
  discountPrice?: string | number;
  stock?: string | number;
  varWeight?: string | number;
  image?: string;
};

/* ===============================
   MAIN FETCHER
================================ */
export async function getProducts(): Promise<{
  products: Product[];
  variants: ProductVariant[];
}> {
  const [pRes, vRes] = await Promise.all([
    fetch(`https://opensheet.elk.sh/${SHEET_ID}/${TAB_PRODUCTS}`, {
      cache: "no-store",
    }),
    fetch(`https://opensheet.elk.sh/${SHEET_ID}/${TAB_VARIANTS}`, {
      cache: "no-store",
    }),
  ]);

  if (!pRes.ok) {
    return { products: [], variants: [] };
  }

  const productsSheet: SheetProductRow[] = await pRes.json();
  const variantsSheet: SheetVariantRow[] = vRes.ok ? await vRes.json() : [];

  /* =========================
     MAP PRODUCTS
  ========================= */
  const products: Product[] = productsSheet.map((row, idx) => {
    const productId =
      row.productId?.trim() || `product-${idx}`;

    const name = row.name?.trim() || "Produk";

    let gallery: string[] = [];

    if (typeof row.gallery === "string" && row.gallery.trim() !== "") {
      try {
        const parsed = JSON.parse(row.gallery);

        if (Array.isArray(parsed)) {
          gallery = parsed.filter(
            (g): g is string =>
              typeof g === "string" && g.startsWith("http")
          );
        }
      } catch {
        // fallback legacy CSV (kalau ada data lama)
        gallery = row.gallery
          .split(",")
          .map((g) => g.trim())
          .filter((g) => g.startsWith("http"));
      }
    }


    return {
      productId,
      name,
      slug: row.slug?.trim() || slugify(name),
      description: row.description,

      image:
        typeof row.image === "string" && row.image.startsWith("http")
          ? row.image
          : gallery[0] || "/placeholder.png",

      gallery,
      category: row.category,

      tags:
        typeof row.tags === "string"
          ? row.tags.split(",").map((t) => t.trim())
          : undefined,

      price:
        row.price !== undefined && row.price !== ""
          ? Number(row.price)
          : undefined,

      discountPrice:
        row.discountPrice !== undefined && row.discountPrice !== ""
          ? Number(row.discountPrice)
          : null,

      weight:
        row.weight !== undefined && row.weight !== ""
          ? Number(row.weight)
          : undefined,

      marketplace: {
        shopee: row.shopee,
        tokopedia: row.tokopedia,
        tiktok: row.tiktok,
      },

      createdAt: row.createdAt,
    };
  });

  /* =========================
     MAP VARIANTS (SSOT)
  ========================= */
  const variants: ProductVariant[] = variantsSheet
    .map((row): ProductVariant | null => {
      const productId = row.productId?.trim();
      const variantId = row.variantId?.trim();

      if (!productId || !variantId) return null;

      return {
        variantId,
        productId,

        variation1Name: row.variation1Name || "Variasi",
        variation1Value: row.variation1Value || "",

        variation2Name: row.variation2Name || undefined,
        variation2Value: row.variation2Value || undefined,

        price: Number(row.price) || 0,

        discountPrice:
          row.discountPrice !== undefined && row.discountPrice !== ""
            ? Number(row.discountPrice)
            : null,

        stock: Number(row.stock) || 0,

        varWeight:
          row.varWeight !== undefined && row.varWeight !== ""
            ? Number(row.varWeight)
            : undefined,

        image:
          typeof row.image === "string" && row.image.startsWith("http")
            ? row.image
            : undefined,
      };
    })
    .filter(Boolean) as ProductVariant[];

  return { products, variants };
}

/* ===============================
   HELPERS
================================ */
export async function getProductBySlug(slug: string): Promise<{ product: Product; variants: ProductVariant[] } | null> {
  const { products, variants } = await getProducts();

  const product = products.find((p) => p.slug === slug);
  if (!product) return null;

  const productVariants = variants.filter((v) => v.productId === product.productId);

  return { product, variants: productVariants };
}
