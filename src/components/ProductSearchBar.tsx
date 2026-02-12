"use client";

import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function ProductSearchBar({ value, onChange }: Props) {
  return (
    <div className="relative w-full">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari produk fashion, hijab, dress..."
        className="w-full rounded-2xl border border-pink-200 bg-white py-3 pl-11 pr-10 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-pink-50"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
