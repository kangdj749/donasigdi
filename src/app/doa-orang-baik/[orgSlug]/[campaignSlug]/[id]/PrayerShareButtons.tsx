"use client";

import { useEffect, useState } from "react";
import { getAffiliate } from "@/lib/affiliate";

/* ================= TYPES ================= */

type Props = {
  message: string;
  campaignSlug: string;
  organizationSlug: string;
  campaignTitle?: string;
  prayerId: string;
};

/* ================= COMPONENT ================= */

export default function PrayerShareButtons({
  message,
  campaignSlug,
  organizationSlug,
  campaignTitle,
  prayerId,
}: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  /* ================= BUILD URL (UPDATED AFFILIATE) ================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const affiliate = getAffiliate();

    /* 🔥 FINAL SOURCE OF TRUTH */
    const ref = affiliate?.code || "";
    const src = affiliate?.source || `doa_${prayerId}`;

    const url = `${window.location.origin}/doa-orang-baik/${organizationSlug}/${campaignSlug}/${prayerId}?ref=${ref}&src=${src}`;

    setShareUrl(url);
  }, [campaignSlug, organizationSlug, prayerId]);

  /* ================= HANDLERS ================= */

  const handleWA = () => {
    if (!shareUrl) return;

    const text = `🤲 Doa untuk ${
      campaignTitle ?? "kebaikan"
    }

"${message}"

Yuk bantu juga 🙏

${shareUrl}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link berhasil disalin 🙌");
    } catch {
      alert("Gagal menyalin link");
    }
  };

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div className="card space-y-4 animate-fadeUp">

      <p className="caption text-center">
        Bagikan doa ini 💚
      </p>

      {/* ACTIONS */}
      <div className="flex gap-2">

        <button
          onClick={handleWA}
          disabled={!shareUrl}
          className="btn btn-primary flex-1 disabled:opacity-50"
        >
          WhatsApp
        </button>

        <button
          onClick={handleCopy}
          disabled={!shareUrl}
          className="btn btn-outline flex-1 disabled:opacity-50"
        >
          Copy Link
        </button>

      </div>

      {/* URL DISPLAY */}
      <div className="text-center break-all h-[48px] flex items-center justify-center">
        <span className="caption-subtle">
          {shareUrl ?? "Memuat link..."}
        </span>
      </div>

    </div>
  );
}