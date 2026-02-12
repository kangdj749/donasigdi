export function formatOrderItemsReadable(items: any[]) {
  return items
    .map((item, idx) => {
      const variations = item.variations
        ? Object.entries(item.variations)
            .map(([k, v]) => `• ${k}: ${v}`)
            .join("\n")
        : "";

      return (
        `${idx + 1}️⃣ ${item.name}\n` +
        (variations ? variations + "\n" : "") +
        `• Qty: ${item.qty}\n` +
        `• Harga: ${Number(item.price).toLocaleString("id-ID")}`
      );
    })
    .join("\n\n");
}
