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

  useEffect(() => {
    if (window.snap) {
      setSnapReady(true);
      return;
    }

    const script = document.createElement("script");

    script.src =
      process.env.MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
    );

    script.async = true;

    script.onload = () => {
      setSnapReady(true);
    };

    document.body.appendChild(script);
  }, []);

  const handleDonate = async () => {
    if (!window.snap || !snapReady) return;

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

      const data = await res.json();

      if (!data.token) {
        setLoading(false);
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: () => window.location.reload(),
        onPending: () => window.location.reload(),
        onError: () => alert("Pembayaran gagal"),
      });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 space-y-4">
        <input
          type="text"
          placeholder="Nama"
          className="w-full border rounded-xl p-3"
          value={form.donor_name}
          onChange={(e) =>
            setForm({ ...form, donor_name: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="No WA / Email"
          className="w-full border rounded-xl p-3"
          value={form.donor_contact}
          onChange={(e) =>
            setForm({ ...form, donor_contact: e.target.value })
          }
        />

        <input
          type="number"
          className="w-full border rounded-xl p-3"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: Number(e.target.value) })
          }
        />

        <textarea
          placeholder="Tulis doa (opsional)"
          className="w-full border rounded-xl p-3"
          value={form.message}
          onChange={(e) =>
            setForm({ ...form, message: e.target.value })
          }
        />

        <label className="flex items-center gap-2 text-sm">
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
          className="w-full bg-green-600 text-white py-3 rounded-2xl font-semibold"
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
