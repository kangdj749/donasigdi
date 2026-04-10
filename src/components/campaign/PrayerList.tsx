"use client";

import { useEffect, useMemo, useState } from "react";
import PrayerForm from "./PrayerForm";
import { getAffiliate } from "@/lib/affiliate";

/* ================= TYPES ================= */

export type Prayer = {
  id: string;
  name: string;
  message: string;
  target_name: string;
  amen_count: number;
  share_count: number;
  created_at: string;
};

type PrayerNormalized = Prayer;

/* ================= NORMALIZER ================= */

function normalize(p: Partial<Prayer>): PrayerNormalized {
  return {
    id: String(p.id ?? crypto.randomUUID()),
    name: p.name?.trim() || "Hamba Allah",
    message: p.message?.trim() || "",
    target_name: p.target_name?.trim() || "",
    amen_count: Number(p.amen_count ?? 0),
    share_count: Number(p.share_count ?? 0),
    created_at:
      p.created_at && !isNaN(new Date(p.created_at).getTime())
        ? p.created_at
        : new Date().toISOString(),
  };
}

/* ================= COMPONENT ================= */

type Props = {
  initialData: Prayer[];
  campaignId: string;
  organizationId: string;
  campaignSlug: string;
  organizationSlug: string;
  showHeader?: boolean;
};

export default function PrayerList({
  initialData,
  campaignId,
  organizationId,
  campaignSlug,
  organizationSlug,
  showHeader = true,

}: Props) {
  const [list, setList] = useState<PrayerNormalized[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeShare, setActiveShare] =
    useState<PrayerNormalized | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  const [mode, setMode] =
    useState<"viral" | "latest" | "top">("viral");

  /* ================= INIT ================= */

  useEffect(() => {
    setList(initialData.map(normalize));
  }, [initialData]);

  /* ================= SORT ================= */

  const sorted = useMemo(() => {
    const arr = [...list];

    if (mode === "latest") {
      return arr.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    if (mode === "top") {
      return arr.sort(
        (a, b) => b.amen_count - a.amen_count
      );
    }

    return arr.sort(
      (a, b) =>
        b.share_count * 3 +
        b.amen_count * 2 -
        (a.share_count * 3 + a.amen_count * 2)
    );
  }, [list, mode]);

  /* ================= REALTIME ================= */

  useEffect(() => {
    const ev = new EventSource("/api/realtime");

    ev.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (!data?.prayerId) return;

      setList((prev) =>
        prev.map((p) => {
          if (p.id !== data.prayerId) return p;

          if (data.type === "amen") {
            return { ...p, amen_count: data.total };
          }

          if (data.type === "share") {
            return { ...p, share_count: data.total };
          }

          return p;
        })
      );
    };

    return () => ev.close();
  }, []);

  /* ================= BUILD SHARE URL ================= */

  function createShareUrl(id: string) {
    if (typeof window === "undefined") return "";

    const affiliate = getAffiliate();

    const ref = affiliate?.code || "";
    const src = affiliate?.source || "direct";

    return `${window.location.origin}/doa-orang-baik/${organizationSlug}/${campaignSlug}/${id}?ref=${ref}&src=${src}`;
  }

  /* ================= COPY HANDLER (FIX) ================= */

  async function handleCopy() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link berhasil disalin 🙌");
    } catch {
      /* fallback */
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      alert("Link berhasil disalin 🙌");
    }
  }

  /* ================= ACTIONS ================= */

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

  async function handleShare(p: PrayerNormalized) {
    const url = createShareUrl(p.id);

    setShareUrl(url);
    setActiveShare(p);

    setList((prev) =>
      prev.map((x) =>
        x.id === p.id
          ? { ...x, share_count: x.share_count + 1 }
          : x
      )
    );

    fetch("/api/prayers/share", {
      method: "POST",
      body: JSON.stringify({ prayerId: p.id }),
    }).catch(() => {});
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      {showHeader && (
      <div className="flex items-center justify-between">
        <h3 className="h3">🤲 Doa Orang Baik</h3>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn btn-outline"
        >
          {showForm ? "Tutup" : "+ Tulis Doa"}
        </button>
      </div>
      )} 

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
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
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
            organizationId={organizationId}
            campaignSlug={campaignSlug}
            organizationSlug={organizationSlug}
            onSuccess={(p) =>
              setList((prev) => [
                normalize(p),
                ...prev,
              ])
            }
          />
        </div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {sorted.map((p) => (
          <div key={p.id} className="card space-y-3 hover:shadow-md transition">

            {p.target_name && (
              <p className="caption text-primary">
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
                  className="btn btn-outline text-xs"
                >
                  🤲 {p.amen_count}
                </button>

                <button
                  onClick={() => handleShare(p)}
                  className="btn btn-outline text-xs"
                >
                  🔗 {p.share_count}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* SHARE MODAL */}
      {activeShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">

          <div className="card max-w-md w-full space-y-4 animate-fadeUp">

            <h3 className="h4">Bagikan Doa 💚</h3>

            <div className="caption p-3 border rounded-xl bg-[rgb(var(--color-soft))] break-all">
              {shareUrl}
            </div>

            <button
              onClick={handleCopy}
              className="btn btn-primary w-full"
            >
              Copy Link
            </button>

            <button
              onClick={() => setActiveShare(null)}
              className="btn btn-outline w-full"
            >
              Tutup
            </button>

          </div>
        </div>
      )}
    </div>
  );
}