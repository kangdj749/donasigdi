"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

/* ================= TYPES ================= */

type PaymentStatus = "pending" | "paid";
type StatusFilter = "pending" | "paid" | "all";

type OrderRow = {
  order_id: string;
  created_at: string;
  name: string;
  phone: string;
  total: number;
  payment_status: PaymentStatus;
  affiliate_code?: string | null;
};

const STATUSES: StatusFilter[] = ["pending", "paid", "all"];

/* ================= COMPONENT ================= */

export default function OrderTable() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  /* ================= LOAD DATA ================= */

  const load = useCallback(async () => {
    setLoading(true);

    const qs = status === "all" ? "" : `?status=${status}`;
    const res = await fetch(`/api/admin/orders${qs}`, {
      cache: "no-store",
    });

    const data: OrderRow[] = await res.json();
    setOrders(data);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  /* ================= ACTION ================= */

  async function markPaid(orderId: string) {
    if (!confirm("Tandai order ini sebagai PAID?")) return;

    setActionId(orderId);

    await fetch("/api/admin/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    setActionId(null);
    load();
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-4">
      {/* FILTER */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-full text-sm border border-border transition
              ${
                status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-white hover:bg-gray-50"
              }`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-gray-500">Loading orders...</div>
      )}

      {/* EMPTY */}
      {!loading && orders.length === 0 && (
        <div className="text-sm text-gray-500">No orders found.</div>
      )}

      {/* ================= MOBILE CARD VIEW ================= */}
      <div className="grid gap-4 md:hidden">
        {orders.map((o) => (
          <div
            key={o.order_id}
            className="rounded-xl border p-4 space-y-2 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="font-medium">{o.name}</div>
              <span
                className={`text-xs px-2 py-1 rounded-full
                  ${
                    o.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {o.payment_status}
              </span>
            </div>

            <Link
              href={`/admin/orders/${o.order_id}`}
              className="text-xs text-primary font-medium hover:underline block"
            >
              {o.order_id}
            </Link>

            <div className="text-sm">
              Total:{" "}
              <strong>
                Rp {o.total.toLocaleString("id-ID")}
              </strong>
            </div>

            {o.affiliate_code && (
              <div className="text-xs text-gray-500">
                Affiliate: {o.affiliate_code}
              </div>
            )}

            {o.payment_status === "pending" && (
              <button
                onClick={() => markPaid(o.order_id)}
                disabled={actionId === o.order_id}
                className="w-full mt-2 py-2 rounded-lg text-sm
                  bg-[var(--color-primary)] text-white
                  disabled:opacity-50"
              >
                {actionId === o.order_id
                  ? "Processing..."
                  : "Mark as Paid"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border rounded-xl overflow-hidden bg-white">
          <thead className="bg-gray-50 text-sm">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Affiliate</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr
                key={o.order_id}
                className="border-t text-sm hover:bg-gray-50"
              >
                <td className="p-3">
                  <Link
                    href={`/admin/orders/${o.order_id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {o.order_id}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {new Date(o.created_at).toLocaleString("id-ID")}
                  </div>
                </td>

                <td className="p-3">
                  <div>{o.name}</div>
                  <div className="text-xs text-gray-500">
                    {o.phone}
                  </div>
                </td>

                <td className="p-3">
                  Rp {o.total.toLocaleString("id-ID")}
                </td>

                <td className="p-3">
                  {o.affiliate_code ?? "-"}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs
                      ${
                        o.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {o.payment_status}
                  </span>
                </td>

                <td className="p-3">
                  {o.payment_status === "pending" && (
                    <button
                      onClick={() => markPaid(o.order_id)}
                      disabled={actionId === o.order_id}
                      className="px-3 py-1.5 rounded-md text-xs
                        bg-[var(--color-primary)] text-white
                        disabled:opacity-50"
                    >
                      {actionId === o.order_id ? "..." : "Mark Paid"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
