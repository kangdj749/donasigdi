"use client";

import { useEffect, useState } from "react";

type CommissionRow = {
  order_id: string;
  order_total: number;
  commission: number;
  status: "earned" | "paid";
  created_at: string;
};

export default function CommissionTable({ code }: { code: string }) {
  const [rows, setRows] = useState<CommissionRow[]>([]);

  useEffect(() => {
    fetch(`/api/affiliate/commissions?code=${code}`)
      .then((res) => res.json())
      .then(setRows);
  }, [code]);

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-sm md:text-base">
          Riwayat Komisi
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Order</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Komisi</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.order_id} className="border-t">
                <td className="px-3 py-2 font-mono">
                  {r.order_id}
                </td>
                <td className="px-3 py-2 text-right">
                  Rp {r.order_total.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  Rp {r.commission.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-center">
                  <Badge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ status }: { status: "earned" | "paid" }) {
  return (
    <span
      className={`inline-flex px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${
        status === "paid"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status}
    </span>
  );
}
