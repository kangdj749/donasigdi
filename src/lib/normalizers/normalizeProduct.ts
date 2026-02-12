import type { Product, ProductVariant } from "@/types/product";
import type {
  ProductView,
  ProductVariantView,
  ProductVariation,
} from "@/types";

/* =========================
   NORMALIZE PRODUCT
========================= */

export function normalizeProduct(
  product: Product,
  variants: ProductVariant[]
): ProductView {
  /* ================= VARIATIONS ================= */
  const variationMap = new Map<string, Set<string>>();

  variants.forEach((v) => {
    if (v.variation1Name && v.variation1Value) {
      if (!variationMap.has(v.variation1Name)) {
        variationMap.set(v.variation1Name, new Set());
      }
      variationMap.get(v.variation1Name)!.add(v.variation1Value);
    }

    if (v.variation2Name && v.variation2Value) {
      if (!variationMap.has(v.variation2Name)) {
        variationMap.set(v.variation2Name, new Set());
      }
      variationMap.get(v.variation2Name)!.add(v.variation2Value);
    }
  });

  const variations: ProductVariation[] = Array.from(
    variationMap.entries()
  ).map(([name, options]) => ({
    name,
    options: Array.from(options),
  }));

  /* ================= VARIANT VIEW ================= */
  const variantViews: ProductVariantView[] = variants.map(
    (v): ProductVariantView => ({
      variantId: v.variantId,

      optionMap: {
        [v.variation1Name]: v.variation1Value,
        ...(v.variation2Name && v.variation2Value
          ? { [v.variation2Name]: v.variation2Value }
          : {}),
      },

      price: v.price,
      discountPrice: v.discountPrice ?? undefined,
      stock: v.stock,

      image: v.image || product.image,
      weight: v.varWeight ?? product.weight,
    })
  );

  return {
    ...product,
    variations: variations.length ? variations : undefined,
    variants: variantViews.length ? variantViews : undefined,
  };
}
