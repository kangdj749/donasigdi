"use client";

import { ShoppingCart } from "lucide-react";

type Props = {
  price: number;
  onAdd: () => void;
  disabled?: boolean;
};

export default function StickyAddToCart({
  price,
  onAdd,
  disabled,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-pink-100 p-4 flex items-center gap-3 sm:hidden">
      <div className="flex-1">
        <p className="text-xs text-gray-500">Harga</p>
        <p className="font-bold text-pink-500">
          Rp {price.toLocaleString("id-ID")}
        </p>
      </div>

      <button
        onClick={onAdd}
        disabled={disabled}
        className="flex items-center gap-2 bg-pink-500 text-white px-4 py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        <ShoppingCart className="w-5 h-5" />
        Beli
      </button>
    </div>
  );
}
