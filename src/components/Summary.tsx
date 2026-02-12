"use client";

import { useEffect, useState } from "react";

type SummaryData = {
  total_earned: number;
  total_paid: number;
  available_balance: number;
  total_orders: number;
};

export default function Summary({ code }: { code: string }) {
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    fetch(`/api/affiliate/summary?code=${code}`)
      .then((res) => res.json())
      .then(setData);
  }, [code]);

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card label="Total Komisi" value={data.total_earned} />
      <Card label="Sudah Dibayar" value={data.total_paid} />
      <Card
        label="Saldo Tersedia"
        value={data.available_balance}
        highlight
      />
      <Card label="Total Order" value={data.total_orders} />
    </div>
  );
}

function Card({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        highlight ? "bg-green-50 border-green-200" : "bg-white"
      }`}
    >
      <p className="text-xs md:text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-lg md:text-xl font-bold">
        Rp {value.toLocaleString()}
      </p>
    </div>
  );
}
