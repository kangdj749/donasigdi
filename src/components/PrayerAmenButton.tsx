"use client";

import { useState } from "react";

interface Props {
  prayerId: string;
  initialCount: number;
}

export default function PrayerAmenButton({
  prayerId,
  initialCount,
}: Props) {
  const [count, setCount] = useState<number>(initialCount);
  const [loading, setLoading] = useState(false);

  const handleAmen = async () => {
    if (loading) return;

    setCount((prev) => prev + 1); // optimistic
    setLoading(true);

    await fetch("/api/prayer-amen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prayerId }),
    });

    setLoading(false);
  };

  return (
    <button
      onClick={handleAmen}
      className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-2"
    >
      🤲 Aamiin ({count})
    </button>
  );
}
