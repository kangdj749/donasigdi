
"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Summary from "@/components/Summary";
import CommissionTable from "@/components/CommissionTable";
import { getAffiliate } from "@/lib/affiliate";

export default function AffiliateDashboard() {
  const [code, setCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const affiliate = getAffiliate();
    setCode(affiliate?.code ?? null);
    setReady(true);
  }, []);

  // 🟡 SELAMA HYDRATION
  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Memuat dashboard...
      </div>
    );
  }

  // 🔴 TIDAK ADA AFFILIATE
  if (!code) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Affiliate tidak ditemukan
      </div>
    );
  }

  // 🟢 NORMAL RENDER
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-bold">
          Dashboard Affiliate
        </h1>
        <p className="text-sm text-gray-500">
          Kode referral: <span className="font-mono">{code}</span>
        </p>
      </div>

      <Summary code={code} />
      <CommissionTable code={code} />
    </div>
  );
}
