"use client";

import { useEffect, useMemo, useState } from "react";
import { useAffiliateContext } from "@/components/system/AffiliateContext";

/* ================= TYPES ================= */

type Props = {
  campaignId: string;
  organizationId: string;
  campaignSlug: string;
  organizationSlug: string;
  category?: string; // 🔥 future ready
  affiliateCode: string | null;
  onClose: () => void;
};

type DonationForm = {
  donor_name: string;
  donor_contact: string;
  amount: number;
  message: string;
  is_anonymous: boolean;
};

type SnapResult = {
  order_id?: string;
};

/* ================= CONST ================= */

const PRESET_AMOUNTS = [20000, 50000, 100000, 200000];
const MIN_AMOUNT = 10000;

/* ================= COMPONENT ================= */

export default function DonationDrawer({
  campaignId,
  organizationId,
  campaignSlug,
  organizationSlug,
  category,
  affiliateCode,
  onClose,
}: Props) {
  const [snapReady, setSnapReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const { ref, src } = useAffiliateContext();

  const [form, setForm] = useState<DonationForm>({
    donor_name: "",
    donor_contact: "",
    amount: 50000,
    message: "",
    is_anonymous: false,
  });

  /* ================= AFFILIATE ================= */

  const resolvedAffiliate = useMemo(() => {
    if (affiliateCode) return affiliateCode;
    return ref || null;
  }, [affiliateCode, ref]);

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

    script.onload = () => setSnapReady(true);

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /* ================= VALIDATION ================= */

  function isValid(): boolean {
    return form.amount >= MIN_AMOUNT;
  }

  /* ================= HANDLE DONATE ================= */

  async function handleDonate() {
    if (!snapReady || !isValid() || !window.snap) return;

    setLoading(true);

    try {
      const payload = {
        campaign_id: campaignId,
        organization_id: organizationId,
        campaign_slug: campaignSlug,
        organization_slug: organizationSlug,
        category: category ?? "", // 🔥 future ready

        donor_name:
          form.is_anonymous || !form.donor_name
            ? "Hamba Allah"
            : form.donor_name,

        donor_contact: form.donor_contact || "",
        amount: Math.max(form.amount, MIN_AMOUNT),
        message: form.message || "",
        is_anonymous: form.is_anonymous,

        ref_code: resolvedAffiliate ?? "",
        ref: resolvedAffiliate ?? "",
        src: src || "direct",

        payment_method: "midtrans",
      };

      const res = await fetch("/api/donations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: { token?: string } = await res.json();

      if (!data?.token) {
        throw new Error("Snap token not found");
      }

      const snap = window.snap;

      if (!snap) {
        throw new Error("Snap not available");
      }

      snap.pay(data.token, {
        onSuccess: (result) => {
          const r = result as SnapResult;

          window.location.href = r.order_id
            ? `/donasi/sukses?id=${r.order_id}`
            : "/donasi/gagal";
        },

        onPending: (result) => {
          const r = result as SnapResult;

          window.location.href = r.order_id
            ? `/donasi/sukses?id=${r.order_id}`
            : "/donasi/gagal";
        },

        onError: () => {
          window.location.href = "/donasi/gagal";
        },

        onClose: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      console.error("🔥 Donation error:", err);
      setLoading(false);
    }
  }

  /* ================= FORMAT ================= */

  function formatCurrency(val: number): string {
    return `Rp ${val.toLocaleString("id-ID")}`;
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative mt-auto w-full container-main animate-fadeUp">
        <div className="rounded-t-[var(--radius-xl)] bg-[rgb(var(--color-bg))] p-5 shadow-[var(--shadow-elevated)] space-y-5">

          <div className="mx-auto h-1.5 w-12 rounded-full bg-[rgb(var(--color-border))]" />

          <div className="space-y-1">
            <h2 className="h3">💚 Donasi Sekarang</h2>
            <p className="caption text-[rgb(var(--color-muted))]">
              Setiap donasi kamu berarti besar 🙏
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() =>
                  setForm((prev) => ({ ...prev, amount: amt }))
                }
                className={`rounded-[var(--radius-md)] border px-3 py-2 text-sm transition ${
                  form.amount === amt
                    ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))/0.1] text-primary"
                    : "border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-soft))]"
                }`}
              >
                {formatCurrency(amt)}
              </button>
            ))}
          </div>

          <input
            type="number"
            min={MIN_AMOUNT}
            value={form.amount}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                amount: Number(e.target.value),
              }))
            }
            className="w-full rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] px-3 py-2 body focus:outline-none focus:border-[rgb(var(--color-primary))]"
          />

          <input
            placeholder="Nama (opsional)"
            value={form.donor_name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                donor_name: e.target.value,
              }))
            }
            className="w-full rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] px-3 py-2 body"
          />

          <input
            placeholder="No HP / Email (opsional)"
            value={form.donor_contact}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                donor_contact: e.target.value,
              }))
            }
            className="w-full rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] px-3 py-2 body"
          />

          <textarea
            placeholder="Tulis doa atau pesan 🤲"
            value={form.message}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                message: e.target.value,
              }))
            }
            className="w-full rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] px-3 py-2 body"
          />

          <label className="flex items-center gap-2 caption">
            <input
              type="checkbox"
              checked={form.is_anonymous}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  is_anonymous: e.target.checked,
                }))
              }
            />
            Sembunyikan nama saya
          </label>

          {resolvedAffiliate && (
            <div className="px-3 py-2 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-soft))] text-center caption">
              Kode Relawan:
              <span className="text-primary font-medium ml-1">
                #{resolvedAffiliate}
              </span>
            </div>
          )}

          <button
            onClick={handleDonate}
            disabled={!snapReady || loading || !isValid()}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Lanjut Pembayaran"}
          </button>

          <button
            onClick={onClose}
            className="w-full text-center caption text-[rgb(var(--color-muted))]"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}