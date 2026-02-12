"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

type Data = {
  featured: Product[];
  bestSeller: Product[];
};

export default function HomeCuratedProducts() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products/featured", {
      cache: "force-cache",
      next: { revalidate: 60 },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-12">
        <SkeletonSection />
        <SkeletonSection />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-12">
      <Section title="✨ Rekomendasi Kami" products={data.featured} />
      <Section title="🔥 Best Seller" products={data.bestSeller} />

      <div className="text-center pt-2">
        <Link
          href="/produk"
          className="inline-block text-pink-600 font-semibold hover:underline"
        >
          Lihat semua produk →
        </Link>
      </div>
    </div>
  );
}

/* ================= UI ================= */

function Section({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  if (!products?.length) return null;

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.productId} product={p} />
        ))}
      </div>
    </section>
  );
}

/* ================= SKELETON ================= */

function SkeletonSection() {
  return (
    <div>
      <div className="h-6 w-48 bg-muted rounded mb-4 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
