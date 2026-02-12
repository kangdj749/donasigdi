type RawItem = any;

export function normalizeOrderItem(item: RawItem) {
  const variations = item.selectedVariations || item.variations || {};

  const keys = Object.keys(variations);

  return {
    productId: item.product?.id || item.productId || item.id,
    qty: Number(item.qty) || 1,

    variation1Name: keys[0],
    variation1Value: keys[0] ? String(variations[keys[0]]) : undefined,

    variation2Name: keys[1],
    variation2Value: keys[1] ? String(variations[keys[1]]) : undefined,
  };
}
