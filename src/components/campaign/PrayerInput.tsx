"use client";

import { useState } from "react";

export default function PrayerInput({
  onSubmit,
}: {
  onSubmit: (data: { name?: string; message: string }) => void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) return;

    onSubmit({
      name: name || "Orang Baik",
      message,
    });

    setMessage("");
  };

  return (
    <div className="card space-y-3">

      <p className="text-[12px] font-medium">
        🤲 Kirim Doa Terbaikmu
      </p>

      <input
        placeholder="Nama (opsional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full text-[12px] px-3 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-transparent outline-none"
      />

      <textarea
        placeholder="Tulis doa untuk mereka..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={300}
        className="w-full text-[13px] px-3 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-transparent outline-none"
      />

      <div className="flex justify-between items-center">

        <span className="text-[11px] text-muted">
          {message.length}/300
        </span>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-[12px] rounded-lg bg-[rgb(var(--color-primary))] text-white"
        >
          Kirim Doa
        </button>

      </div>
    </div>
  );
}