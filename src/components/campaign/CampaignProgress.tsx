"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  slug: string;
  initialCollected?: number;
  goal_amount?: number;
};

export default function CampaignProgress({
  slug,
  initialCollected = 0,
  goal_amount = 0,
}: Props) {
  const [collected, setCollected] = useState(initialCollected);

  /* ================= FETCH REALTIME ================= */

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/campaign/${slug}`, {
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = await res.json();
        setCollected(Number(data.collected_amount));
      } catch (err) {
        console.error("Progress fetch error", err);
      }
    };

    const interval = setInterval(fetchLatest, 5000);
    fetchLatest();

    return () => clearInterval(interval);
  }, [slug]);

  /* ================= CALCULATE ================= */

  const percent = useMemo(() => {
    if (goal_amount <= 0) return 0;
    return Math.min(
      100,
      Math.round((collected / goal_amount) * 100)
    );
  }, [collected, goal_amount]);

  /* ================= UI ================= */

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-green-600">
          Rp {collected.toLocaleString("id-ID")}
        </span>
        <span className="text-gray-500">
          dari Rp {goal_amount.toLocaleString("id-ID")}
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-2 bg-green-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-gray-500">
        {percent}% tercapai
      </p>
    </div>
  );
}
