"use client";

import Link from "next/link";
import { X } from "lucide-react";

const koleksi = [
  { label: "Gamis", href: "/koleksi/gamis-one-set-terbaru" },
  { label: "Jilbab", href: "/koleksi/jilbab-malay-untuk-acara" },
  { label: "Best Seller", href: "/koleksi/best-seller" },
  { label: "Promo", href: "/promo" },
];

export default function KoleksiSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl p-4 animate-slideUp">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Koleksi</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="grid gap-3">
          {koleksi.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
