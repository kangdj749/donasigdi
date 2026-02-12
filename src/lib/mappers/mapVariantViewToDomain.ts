import { ProductVariant, ProductVariantView } from "@/types";

export function mapVariantViewToDomain(
  view: ProductVariantView,
  productId: string
): ProductVariant {
  const entries = Object.entries(view.optionMap);

  return {
    variantId: view.variantId,
    productId,

    variation1Name: entries[0][0],
    variation1Value: entries[0][1],

    variation2Name: entries[1]?.[0],
    variation2Value: entries[1]?.[1],

    price: view.price,
    discountPrice:
      view.discountPrice !== undefined
        ? view.discountPrice
        : null,
    stock: view.stock,

    varWeight: view.weight,
    image: view.image,
  };
}
