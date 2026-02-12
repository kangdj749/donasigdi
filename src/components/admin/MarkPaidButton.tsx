"use client";

import { useState } from "react";

export default function MarkPaidButton({
  orderId,
  onSuccess,
}: {
  orderId: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function markPaid() {
    if (!confirm("Yakin tandai order ini sebagai PAID?")) return;

    setLoading(true);
    const res = await fetch("/api/admin/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Gagal update status");
      return;
    }

    onSuccess();
  }

  return (
    <button
      disabled={loading}
      onClick={markPaid}
      className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white disabled:opacity-50"
    >
      {loading ? "Processing…" : "Mark as Paid"}
    </button>
  );
}
