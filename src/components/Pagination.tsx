"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  page: number;
  totalPages: number;
};

export default function Pagination({ page, totalPages }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  const go = (p: number) => {
    const q = new URLSearchParams(params.toString());
    q.set("page", String(p));
    router.push(`?${q.toString()}`);
  };

  return (
    <div className="flex justify-center gap-2 mt-12">
      <button
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className="px-3 py-2 rounded bg-gray-100 disabled:opacity-40"
      >
        ←
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => go(p)}
            className={`px-4 py-2 rounded ${
              p === page
                ? "bg-pink-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        disabled={page >= totalPages}
        onClick={() => go(page + 1)}
        className="px-3 py-2 rounded bg-gray-100 disabled:opacity-40"
      >
        →
      </button>
    </div>
  );
}
