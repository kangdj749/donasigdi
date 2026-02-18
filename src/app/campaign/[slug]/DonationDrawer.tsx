"use client";

import { useEffect, useState } from "react";

type Props = {
  campaignId: string;
  affiliateCode: string | null;
  onClose: () => void;
};

export default function DonationDrawer({
  campaignId,
  affiliateCode,
  onClose,
}: Props) {
  const [snapReady, setSnapReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    donor_name: "",
    donor_contact: "",
    amount: 50000,
    message: "",
    is_anonymous: false,
  });

  /* ================= LOAD SNAP ================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.snap) {
        setSnapReady(true);
        return;
        }


    const script = document.createElement("script");

    script.src =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
    );

    script.async = true;

    script.onload = () => {
      setSnapReady(true);
    };

    document.body.appendChild(script);
  }, []);

  /* ================= HANDLE DONATE ================= */

  const handleDonate = async () => {
    if (!snapReady) return;

    setLoading(true);

    try {
      const res = await fetch("/api/donations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaignId,
          ...form,
          ref: affiliateCode,
        }),
      });

      const data: { token?: string } = await res.json();

      if (!data.token) {
        setLoading(false);
        return;
      }

      window.snap?.pay(data.token, {
        onSuccess: (result: unknown) => {
          const snapResult = result as { order_id?: string };

          if (snapResult.order_id) {
            window.location.href = `/donasi/sukses?id=${snapResult.order_id}`;
          } else {
            window.location.href = "/donasi/gagal";
          }
        },

        onPending: (result: unknown) => {
          const snapResult = result as { order_id?: string };

          if (snapResult.order_id) {
            window.location.href = `/donasi/sukses?id=${snapResult.order_id}`;
          } else {
            window.location.href = "/donasi/gagal";
          }
        },

        onError: () => {
          window.location.href = "/donasi/gagal";
        },

        onClose: () => {
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Donation error:", error);
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 space-y-4 shadow-xl">

        <h2 className="text-lg font-semibold text-gray-800">
          Form Donasi
        </h2>

        <input
          type="text"
          placeholder="Nama"
          className="w-full border border-gray-200 rounded-xl p-3"
          value={form.donor_name}
          onChange={(e) =>
            setForm({ ...form, donor_name: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="No WA / Email"
          className="w-full border border-gray-200 rounded-xl p-3"
          value={form.donor_contact}
          onChange={(e) =>
            setForm({ ...form, donor_contact: e.target.value })
          }
        />

        <input
          type="number"
          className="w-full border border-gray-200 rounded-xl p-3"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: Number(e.target.value) })
          }
        />

        <textarea
          placeholder="Tulis doa (opsional)"
          className="w-full border border-gray-200 rounded-xl p-3"
          value={form.message}
          onChange={(e) =>
            setForm({ ...form, message: e.target.value })
          }
        />

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.is_anonymous}
            onChange={(e) =>
              setForm({ ...form, is_anonymous: e.target.checked })
            }
          />
          Sembunyikan nama saya
        </label>

        <button
          onClick={handleDonate}
          disabled={!snapReady || loading}
          className="w-full bg-green-600 text-white py-3 rounded-2xl font-semibold disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Lanjut Pembayaran"}
        </button>

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-500"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
