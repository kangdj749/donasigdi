"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  collected_amount: number;
  goal_amount: number;
};

export default function CampaignProgress({
  collected_amount,
  goal_amount,
}: Props) {
  const [displayPercent, setDisplayPercent] = useState(0);

  /* ================= HITUNG PERCENT ================= */

  const percent = useMemo(() => {
    if (goal_amount <= 0) return 0;
    return Math.min(
      100,
      Math.round((collected_amount / goal_amount) * 100)
    );
  }, [collected_amount, goal_amount]);

  /* ================= SMOOTH UPDATE ================= */

  useEffect(() => {
    setDisplayPercent(percent);
  }, [percent]);

  /* ================= UI ================= */

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-green-600">
          Rp {collected_amount.toLocaleString("id-ID")}
        </span>
        <span className="text-gray-500">
          dari Rp {goal_amount.toLocaleString("id-ID")}
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-2 bg-green-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${displayPercent}%` }}
        />
      </div>

      <p className="text-xs text-gray-500">
        {displayPercent}% tercapai
      </p>
    </div>
  );
}
