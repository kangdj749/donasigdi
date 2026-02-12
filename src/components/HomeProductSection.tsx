"use client";

import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

type Props = {
  products: Product[];
  title?: string;
};

export default function HomeProductSection({
  products,
  title = "Produk Pilihan",
}: Props) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.productId} product={p} />
        ))}
      </div>
    </section>
  );
}
