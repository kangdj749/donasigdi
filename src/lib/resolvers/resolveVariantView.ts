import { ProductVariantView } from "@/types";

export function resolveVariantView(
  variants: ProductVariantView[] | undefined,
  selected: Record<string, string>
): ProductVariantView {
  if (!variants || variants.length === 0) {
    throw new Error("VARIANT_NOT_FOUND");
  }

  const resolved = variants.find((v) =>
    Object.entries(selected).every(
      ([key, value]) => v.optionMap[key] === value
    )
  );

  if (!resolved) {
    throw new Error("VARIANT_COMBINATION_INVALID");
  }

  if (resolved.stock <= 0) {
    throw new Error("STOCK_EMPTY");
  }

  return resolved;
}
