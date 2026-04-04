"use client";

import { useMemo, useState } from "react";

type Props = {
  slug: string;
  initialCollected?: number;
  goal_amount?: number;
};

export default function CampaignProgress({
  initialCollected = 0,
  goal_amount = 0,
}: Props) {
  const [collected, setCollected] = useState<number>(initialCollected);

  /* ================= CALCULATE ================= */

  const percent = useMemo(() => {
    if (goal_amount <= 0) return 0;

    const raw = (collected / goal_amount) * 100;

    if (raw > 0 && raw < 1) return 1;

    return Math.min(100, Math.round(raw));
  }, [collected, goal_amount]);

  /* ================= FORMAT ================= */

  const formattedCollected = useMemo(
    () => `Rp ${collected.toLocaleString("id-ID")}`,
    [collected]
  );

  const formattedGoal = useMemo(
    () => `Rp ${goal_amount.toLocaleString("id-ID")}`,
    [goal_amount]
  );

  /* ================= UI ================= */

  return (
    <div className="space-y-2">

      {/* HEADER */}
      <div className="flex justify-between items-center text-[12px]">

        <span className="font-semibold text-[rgb(var(--color-primary))]">
          {formattedCollected}
        </span>

        <span className="text-[rgb(var(--color-muted))]">
          dari {formattedGoal}
        </span>

      </div>

      {/* PROGRESS BAR */}
      <div className="relative h-2 w-full rounded-full bg-[rgb(var(--color-soft))] overflow-hidden">

        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[rgb(var(--color-primary))] transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />

      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center text-[11px]">

        <span className="text-[rgb(var(--color-muted))]">
          {percent}% tercapai
        </span>

        {percent >= 100 && (
          <span className="text-[rgb(var(--color-primary))] font-medium">
            🎉 Target tercapai
          </span>
        )}

      </div>
    </div>
  );
}