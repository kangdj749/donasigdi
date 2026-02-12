"use client";

import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import AOS from "aos";

import HeroPremium from "@/components/HeroPremium";
import HomeSearchBar from "@/components/HomeSearchBar";

import HybridWhatsAppCTA from "@/components/HybridWhatsAppCTA";
import HomeCuratedProductsSkeleton from "./HomeCuratedProductsSkeleton";

/* lazy load heavy section */
const HomeCuratedProducts = dynamic(
  () => import("@/components/HomeCuratedProducts"),
  { ssr: false }
);

export default function HomeClient() {
  useEffect(() => {
    const t = setTimeout(() => {
      AOS.init({
        duration: 700,
        once: true,
        easing: "ease-out-cubic",
      });
    }, 200);

    return () => clearTimeout(t);
  }, []);

  return (
    <main className="bg-bg text-text">
      {/* HERO */}
      <section id="beranda" className="pt-16 sm:pt-20 lg:pt-24">
        <HeroPremium />
      </section>

      {/* PRODUK */}
      <section
        id="produk"
        className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-10 max-w-6xl mx-auto"
        data-aos="fade-up"
      >
        <HomeSearchBar />
        <div className="mt-6 sm:mt-8">
          <Suspense fallback={<HomeCuratedProductsSkeleton />}>
          <HomeCuratedProducts />
          </Suspense>
        </div>
      </section>

   

      {/* TENTANG */}
      
    </main>
  );
}
