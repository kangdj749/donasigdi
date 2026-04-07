"use client";

import { useEffect, useMemo, useState } from "react";

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

  /* ================= TRACKING ================= */

  const tracking = useMemo(() => {
    if (typeof window === "undefined") {
      return { ref: "", src: "direct" };
    }

    const params = new URLSearchParams(window.location.search);

    const ref =
      params.get("ref") ||
      localStorage.getItem("ref") ||
      "";

    const src =
      params.get("src") ||
      localStorage.getItem("src") ||
      "direct";

    return { ref, src };
  }, []);

  /* simpan ke localStorage */
  useEffect(() => {
    if (tracking.ref) localStorage.setItem("ref", tracking.ref);
    if (tracking.src) localStorage.setItem("src", tracking.src);
  }, [tracking]);

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
          ref: tracking.ref,
          src: tracking.src,
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

  return (
    <div className="card space-y-4 bg-[rgb(var(--color-soft))]">
      <div>
        <p className="h3">🤲 Tulis Doa</p>
        <p className="caption">Doa kamu bisa diaminkan 💚</p>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ya Allah, semoga..."
        className="w-full min-h-[90px] body p-3 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))]"
      />

      <input
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="Untuk siapa?"
        className="w-full caption p-2 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))]"
      />

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama"
        className="w-full caption p-2 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))]"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? "Mengirim..." : "Kirim Doa 🤲"}
      </button>
    </div>
  );
}