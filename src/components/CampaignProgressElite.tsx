"use client";

import { useEffect, useState, useCallback } from "react";

type Props = {
  campaignId: string;
};

export default function CampaignProgressElite({
  campaignId,
}: Props) {
  const [total, setTotal] = useState(0);
  const [target, setTarget] = useState(1);
  const [percentage, setPercentage] = useState(0);

  const fetchProgress = useCallback(async () => {
    const res = await fetch(
      `/api/campaigns/${campaignId}/progress`
    );

    if (!res.ok) return;

    const data = await res.json();

    const totalValue = Number(data.total);
    const targetValue = Number(data.target);

    setTotal(totalValue);
    setTarget(targetValue);

    const percent = Math.min(
      Math.round((totalValue / targetValue) * 100),
      100
    );

    setPercentage(percent);
  }, [campaignId]);

  useEffect(() => {
    fetchProgress();

    const interval = setInterval(fetchProgress, 10000);

    return () => clearInterval(interval);
  }, [fetchProgress]);

  return (
    <div className="space-y-3">

      <div className="flex justify-between text-sm text-gray-600">
        <span>
          Rp {total.toLocaleString("id-ID")}
        </span>
        <span>
          Target Rp {target.toLocaleString("id-ID")}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-green-500 to-emerald-600 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-green-600">
          {percentage}% tercapai
        </span>

        <span className="text-gray-500">
          Tersisa Rp{" "}
          {(target - total > 0
            ? target - total
            : 0
          ).toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}
