"use client";

import { useEffect, useMemo, useState } from "react";
import PrayerForm from "./PrayerForm";

/* ================= TYPES ================= */

export type Prayer = {
  id?: string;
  name?: string;
  message?: string;
  target_name?: string;
  amen_count?: number;
  share_count?: number;
  created_at?: string;
};

type PrayerNormalized = {
  id: string;
  name: string;
  message: string;
  target_name: string;
  amen_count: number;
  share_count: number;
  created_at: string;
};

/* ================= NORMALIZER ================= */

function normalizePrayer(p: Prayer): PrayerNormalized {
  return {
    id: String(p.id ?? Date.now().toString()),
    name: p.name || "Hamba Allah",
    message: String(p.message ?? ""),
    target_name: p.target_name || "",
    amen_count: Number(p.amen_count ?? 0),
    share_count: Number(p.share_count ?? 0),
    created_at: p.created_at || new Date().toISOString(),
  };
}

/* ================= COPY ================= */

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* ================= VIRAL SCORE ================= */

function getViralScore(p: PrayerNormalized) {
  return p.share_count * 3 + p.amen_count * 2;
}

/* ================= COMPONENT ================= */

export default function PrayerList({
  initialData,
  campaignId,
}: {
  initialData: Prayer[];
  campaignId: string;
}) {
  const [list, setList] = useState<PrayerNormalized[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeShare, setActiveShare] =
    useState<PrayerNormalized | null>(null);
  const [copied, setCopied] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const [mode, setMode] = useState<
    "viral" | "latest" | "top"
  >("viral");

  /* ================= INIT ================= */

  useEffect(() => {
    if (Array.isArray(initialData)) {
      setList(initialData.map(normalizePrayer));
    }
  }, [initialData]);

  /* ================= SORTING ================= */

  const sortedList = useMemo(() => {
    const cloned = [...list];

    if (mode === "latest") {
      return cloned.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    if (mode === "top") {
      return cloned.sort(
        (a, b) => b.amen_count - a.amen_count
      );
    }

    return cloned.sort(
      (a, b) => getViralScore(b) - getViralScore(a)
    );
  }, [list, mode]);

  /* ================= REALTIME ================= */

  useEffect(() => {
    const es = new EventSource("/api/realtime");

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "amen_update") {
          setList((prev) =>
            prev.map((p) =>
              p.id === data.prayerId
                ? { ...p, amen_count: data.total }
                : p
            )
          );
        }

        if (data.type === "share_update") {
          setList((prev) =>
            prev.map((p) =>
              p.id === data.prayerId
                ? { ...p, share_count: data.total }
                : p
            )
          );
        }
      } catch {}
    };

    return () => es.close();
  }, []);

  /* ================= AMEN ================= */

  async function handleAmen(id: string) {
    setList((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, amen_count: p.amen_count + 1 }
          : p
      )
    );

    fetch("/api/prayers/amen", {
      method: "POST",
      body: JSON.stringify({ prayerId: id }),
    }).catch(() => {});
  }

  /* ================= SHARE ================= */

  function buildShareUrl(id: string) {
    return `${window.location.origin}${window.location.pathname}#prayer-${id}`;
  }

  async function handleShare(p: PrayerNormalized) {
    setActiveShare(p);

    setList((prev) =>
      prev.map((item) =>
        item.id === p.id
          ? { ...item, share_count: item.share_count + 1 }
          : item
      )
    );

    try {
      const res = await fetch("/api/prayers/share", {
        method: "POST",
        body: JSON.stringify({ prayerId: p.id }),
      });

      const data = await res.json();

      if (data?.total !== undefined) {
        setList((prev) =>
          prev.map((item) =>
            item.id === p.id
              ? { ...item, share_count: data.total }
              : item
          )
        );
      }
    } catch {}
  }

  /* ================= COPY ================= */

  async function handleCopy() {
    if (!activeShare) return;

    const ok = await copyText(
      buildShareUrl(activeShare.id)
    );

    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="h3">
          🤲 Doa Orang Baik
        </h3>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-outline"
        >
          {showForm ? "Tutup" : "+ Tulis Doa"}
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 overflow-x-auto">

        {[
          { key: "viral", label: "🔥 Viral" },
          { key: "latest", label: "🆕 Terbaru" },
          { key: "top", label: "🙏 Terbanyak" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() =>
              setMode(
                item.key as "viral" | "latest" | "top"
              )
            }
            className={`px-3 py-1.5 rounded-full text-xs border transition
            ${
              mode === item.key
                ? "bg-[rgb(var(--color-primary))] text-white border-transparent"
                : "border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-soft))]"
            }`}
          >
            {item.label}
          </button>
        ))}

      </div>

      {/* FORM */}
      {showForm && (
        <div className="card">
          <PrayerForm
            campaignId={campaignId}
            onSuccess={(p) =>
              setList((prev) => [
                normalizePrayer(p),
                ...prev,
              ])
            }
          />
        </div>
      )}

      {/* EMPTY */}
      {sortedList.length === 0 && (
        <div className="card text-center space-y-2">
          <p className="body">
            Belum ada doa 🙏
          </p>
          <p className="caption">
            Jadilah yang pertama mendoakan 💚
          </p>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-3">

        {sortedList.map((p) => (
          <div
            key={p.id}
            id={`prayer-${p.id}`}
            className="card space-y-3"
          >

            {p.target_name && (
              <p className="caption text-primary font-medium">
                Untuk: {p.target_name}
              </p>
            )}

            <p className="body leading-relaxed">
              {p.message}
            </p>

            <div className="flex justify-between items-center">

              <span className="caption text-muted">
                {p.name}
              </span>

              <div className="flex gap-2">

                <button
                  onClick={() => handleAmen(p.id)}
                  className="btn-ghost text-xs"
                >
                  🤲 {p.amen_count}
                </button>

                <button
                  onClick={() => handleShare(p)}
                  className="btn-ghost text-xs"
                >
                  🔗 {p.share_count}
                </button>

              </div>
            </div>

          </div>
        ))}

      </div>

      {/* MODAL */}
      {activeShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">

          <div className="card max-w-md w-full space-y-4">

            <h3 className="h4">
              Bagikan Doa 💚
            </h3>

            <div className="caption p-3 border rounded-xl bg-[rgb(var(--color-soft))] break-all">
              {buildShareUrl(activeShare.id)}
            </div>

            <button
              onClick={handleCopy}
              className="btn-primary w-full"
            >
              {copied ? "✔ Copied" : "Copy Link"}
            </button>

            <button
              onClick={() => setActiveShare(null)}
              className="btn-ghost w-full text-xs"
            >
              Tutup
            </button>

          </div>
        </div>
      )}
    </div>
  );
}