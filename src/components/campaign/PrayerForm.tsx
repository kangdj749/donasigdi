"use client";

import { useState } from "react";

type Prayer = {
  id: string;
  name?: string;
  message: string;
  target_name?: string;
  amen_count?: number;
};

export default function PrayerForm({
  campaignId,
  onSuccess,
}: {
  campaignId: string;
  onSuccess: (p: Prayer) => void;
}) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/prayers", {
        method: "POST",
        body: JSON.stringify({
          campaign_id: campaignId,
          name,
          target_name: target,
          message,
        }),
      });

      const data: Prayer = await res.json();

      onSuccess(data);

      setMessage("");
      setName("");
      setTarget("");

      // 🔥 trigger share
      window.dispatchEvent(
        new CustomEvent("open-share", {
          detail: data,
        })
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-3 bg-[rgb(var(--color-soft))]">

      <p className="text-[13px] font-semibold">
        🤲 Tulis Doa Kamu
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ya Allah, semoga..."
        className="w-full text-[13px] p-3 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] outline-none"
      />

      <input
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="Untuk siapa? (opsional)"
        className="w-full text-[12px] p-2 rounded-lg border border-[rgb(var(--color-border))]"
      />

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama (opsional)"
        className="w-full text-[12px] p-2 rounded-lg border border-[rgb(var(--color-border))]"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-2 rounded-full text-[13px] font-medium bg-[rgb(var(--color-primary))] text-white"
      >
        {loading ? "Mengirim..." : "Kirim Doa 🤲"}
      </button>

      <p className="text-[11px] text-muted text-center">
        💚 Doa kamu bisa diaminkan banyak orang
      </p>
    </div>
  );
}