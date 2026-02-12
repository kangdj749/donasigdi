"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-muted/30">

      <div className="mx-auto max-w-5xl px-4 py-12 grid gap-8 md:grid-cols-3">

        {/* Brand */}
        <div className="space-y-3">
          <div className="text-lg font-semibold">
            GDI Donasi
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Platform donasi online yang aman dan transparan untuk membantu
            sesama.
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <div className="font-semibold text-sm">
            Navigasi
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary">
                Beranda
              </Link>
            </li>
            <li>
              <Link href="/campaign" className="hover:text-primary">
                Campaign
              </Link>
            </li>
            <li>
              <Link href="/tentang" className="hover:text-primary">
                Tentang Kami
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-3">
          <div className="font-semibold text-sm">
            Legal
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/kebijakan-privasi" className="hover:text-primary">
                Kebijakan Privasi
              </Link>
            </li>
            <li>
              <Link href="/syarat-ketentuan" className="hover:text-primary">
                Syarat & Ketentuan
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GDI Donasi. Semua hak dilindungi.
      </div>
    </footer>
  );
}
