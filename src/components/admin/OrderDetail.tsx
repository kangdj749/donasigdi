"use client";

import { useEffect, useState } from "react";

type OrderDetailData = {
  order_id: string;
  created_at: string;
  name: string;
  phone: string;
  address: string;
  total: number;
  payment_status: "pending" | "paid" | "failed" | "expired";
  payment_method?: string | null;
  affiliate_code?: string | null;
};

export default function OrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function markPaid() {
  if (!confirm("Tandai order ini sebagai PAID?")) return;

  setProcessing(true);

  await fetch("/api/admin/mark-paid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });

  location.reload(); // simpel & aman
}

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/admin/orders/${orderId}`, {
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || "Failed to load order");
        }
        return r.json();
      })
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="text-sm">Loading…</div>;
  if (error)
    return <div className="text-sm text-red-500">{error}</div>;
  if (!order)
    return <div className="text-sm text-red-500">Order not found</div>;

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">
            Order #{order.order_id}
          </h1>
          <p className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleString("id-ID")}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs
            ${
              order.payment_status === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {order.payment_status}
        </span>
        {order.payment_status !== "paid" && (
        <button
            onClick={markPaid}
            disabled={processing}
            className="px-4 py-2 rounded-lg text-sm
            bg-[var(--color-primary)] text-white
            disabled:opacity-50"
        >
            {processing ? "Processing..." : "Mark as Paid"}
        </button>
        )}

      </header>

      <Card title="Customer">
        <Row label="Name" value={order.name} />
        <Row label="Phone" value={order.phone} />
        <Row label="Address" value={order.address || "-"} />
      </Card>

      <Card title="Payment">
        <Row label="Method" value={order.payment_method || "-"} />
        <Row
          label="Total"
          value={`Rp ${order.total.toLocaleString("id-ID")}`}
          strong
        />
      </Card>

      <Card title="Affiliate">
        <Row
          label="Code"
          value={order.affiliate_code || "-"}
        />
      </Card>
    </div>
  );
}

/* ================= UI ATOMS ================= */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-xl p-4 bg-white space-y-2">
      <h2 className="text-sm font-medium text-gray-700">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={strong ? "font-semibold" : ""}>
        {value}
      </span>
    </div>
  );
}
