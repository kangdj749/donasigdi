"use client";

import { useState } from "react";
import { getAffiliate } from "@/lib/affiliate";

/* ================= TYPES ================= */

export type Prayer = {
  id: string;
  name: string;
  message: string;
  target_name: string;
  campaign_slug: string;
  organization_slug: string;
  created_at: string;
};

type Props = {
  campaignId: string;
  organizationId: string;
  campaignSlug: string;
  organizationSlug: string;
  onSuccess: (p: Prayer) => void;
};

/* ================= COMPONENT ================= */

export default function PrayerForm({
  campaignId,
  organizationId,
  campaignSlug,
  organizationSlug,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= AFFILIATE (FINAL) ================= */

  const affiliate = getAffiliate();

  const ref = affiliate?.code || "";
  const src = affiliate?.source || "direct";

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!message.trim() || loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/prayers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          organization_id: organizationId,
          campaign_slug: campaignSlug,
          organization_slug: organizationSlug,
          name,
          message,
          target_name: target,

          /* 🔥 FINAL TRACKING */
          ref,
          src,
        }),
      });

      if (!res.ok) throw new Error();

      const data: Prayer = await res.json();

      onSuccess(data);

      setMessage("");
      setName("");
      setTarget("");
    } catch {
      alert("Gagal mengirim doa 🙏");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="card space-y-4 bg-[rgb(var(--color-soft))] animate-fadeUp">

      {/* HEADER */}
      <div>
        <p className="h3">🤲 Tulis Doa</p>
        <p className="caption">
          Doa kamu bisa diaminkan banyak orang 💚
        </p>
      </div>

      {/* TEXTAREA */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ya Allah, semoga..."
        className="w-full min-h-[90px] body p-3 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
      />

      {/* TARGET */}
      <input
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="Untuk siapa? (opsional)"
        className="w-full caption p-2 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))]"
      />

      {/* NAME */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama (opsional)"
        className="w-full caption p-2 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))]"
      />

      {/* BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn btn-primary w-full disabled:opacity-50"
      >
        {loading ? "Mengirim..." : "Kirim Doa 🤲"}
      </button>

    </div>
  );
}