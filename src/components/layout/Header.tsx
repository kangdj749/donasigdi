"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isCampaign = pathname?.startsWith("/campaign");

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            G
          </div>
          <span className="text-sm font-semibold">
            GDI Donasi
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className={`hover:text-primary ${
              isHome ? "text-primary font-medium" : ""
            }`}
          >
            Beranda
          </Link>

          <Link
            href="/campaign"
            className={`hover:text-primary ${
              isCampaign ? "text-primary font-medium" : ""
            }`}
          >
            Campaign
          </Link>

          <Link
            href="/tentang"
            className="hover:text-primary"
          >
            Tentang
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href="/campaign"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
          >
            Donasi Sekarang
          </Link>
        </div>
      </div>
    </header>
  );
}
