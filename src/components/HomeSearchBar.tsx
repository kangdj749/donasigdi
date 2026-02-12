"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeSearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <form
      onSubmit={submit}
      className="mb-8 max-w-xl mx-auto"
    >
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Cari jilbab, khimar, bergo..."
        className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
      />
    </form>
  );
}
