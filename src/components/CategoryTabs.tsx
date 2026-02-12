"use client";

import Link from "next/link";

type Props = {
  categories: string[];
};

export default function CategoryTabs({ categories }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
      {categories.map((cat) => (
        <Link
          key={cat}
          href={`/kategori/${cat}`}
          className="shrink-0 px-4 py-2 rounded-full border border-pink-300 text-pink-600 text-sm hover:bg-pink-500 hover:text-white transition capitalize"
        >
          {cat.replace(/-/g, " ")}
        </Link>
      ))}
    </div>
  );
}
