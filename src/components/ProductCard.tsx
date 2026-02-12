"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { cloudinaryImage } from "@/lib/utils/cloudinary";

export default function ProductCard({ product }: { product: Product }) {
  
  const basePrice = product.price ?? 0;
  const discountPrice =
    product.discountPrice != null &&
    product.discountPrice < basePrice
      ? product.discountPrice
      : null;

  return (
    <article className="group relative bg-card border border-border rounded-2xl overflow-hidden transition hover:shadow-soft">
      <Link
        href={`/produk/${product.slug}`}
        aria-label={`Detail produk ${product.name}`}
        className="block focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {product.category && (
          <span className="absolute top-3 left-3 z-10 bg-primary/90 text-primary-foreground text-[11px] font-semibold px-2 py-1 rounded-md shadow">
            {product.category}
          </span>
        )}

        <div className="relative aspect-square bg-muted">
          <Image
            src={cloudinaryImage(product.image, "card")}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            decoding="async"
            placeholder="blur"
            blurDataURL="/blur-car.png"
            unoptimized
            className="
              object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
          />
          
         
        </div>

        <div className="p-3 space-y-1">
          <h3 className="text-sm sm:text-base font-semibold line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-2">
            {discountPrice ? (
              <>
                <p className="text-primary font-bold">
                  Rp {discountPrice.toLocaleString("id-ID")}
                </p>
                <p className="text-xs line-through text-foreground/50">
                  Rp {basePrice.toLocaleString("id-ID")}
                </p>
              </>
            ) : (
              <p className="text-primary font-bold">
                Rp {basePrice.toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>
      </Link>

      <Link
        href={`/produk/${product.slug}`}
        className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-2.5 rounded-full shadow-lg hover:bg-primary/90"
        aria-label={`Pilih ${product.name}`}
      >
        <ShoppingCart className="h-5 w-5" />
      </Link>
    </article>
  );
}
