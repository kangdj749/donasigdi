"use client";

import { useState } from "react";

interface Props {
  prayerId: string;
  initialCount: number;
}

export default function AmenButton({
  prayerId,
  initialCount,
}: Props) {
  const [amen, setAmen] = useState<number>(initialCount);
  const [loading, setLoading] = useState(false);

  const handleAmen = async () => {
    if (loading) return;

    // 🔥 optimistic update
    setAmen((prev) => prev + 1);
    setLoading(true);

    try {
      const res = await fetch("/api/prayers/amen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prayerId }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();

      // 🔥 sync dengan server (biar akurat)
      if (typeof data.total === "number") {
        setAmen(data.total);
      }
    } catch (err) {
      console.error("Amen failed:", err);

      // 🔥 rollback kalau gagal
      setAmen((prev) => Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 text-center space-y-2">

      <p className="text-[12px] text-[rgb(var(--color-muted))]">
        🤲 {amen.toLocaleString("id-ID")} orang mengaminkan
      </p>

      <button
        onClick={handleAmen}
        disabled={loading}
        className="px-4 py-2 rounded-full text-[12px] font-medium
        bg-[rgb(var(--color-primary))] text-white
        hover:opacity-90 transition
        disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "..." : "Aamiin 🤍"}
      </button>

    </div>
  );
}