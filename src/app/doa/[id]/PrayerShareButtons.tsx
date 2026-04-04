"use client";

import { useCallback, useMemo } from "react";
import { getAffiliate } from "@/lib/affiliate";

/* ================= TYPES ================= */

type Props = {
  message: string;
  campaignSlug?: string;
  campaignTitle?: string;
  prayerId: string;
};

/* ================= COMPONENT ================= */

export default function PrayerShareButtons({
  message,
  campaignSlug,
  campaignTitle,
  prayerId,
}: Props) {
  /* ================= URL (CORE) ================= */

  const shareUrl = useMemo(() => {
    const affiliate = getAffiliate();

    const query = new URLSearchParams();

    if (affiliate?.code) {
      query.set("ref", affiliate.code);
    }

    query.set("src", `doa_${prayerId}`);

    if (!campaignSlug) {
      return window.location.href;
    }

    return `${window.location.origin}/campaign/${campaignSlug}?${query.toString()}`;
  }, [campaignSlug, prayerId]);

  /* ================= SHARE TEXT ================= */

  const shareText = useMemo(() => {
    return buildShareText({
      message,
      campaignTitle,
      url: shareUrl,
    });
  }, [message, campaignTitle, shareUrl]);

  /* ================= WHATSAPP ================= */

  const handleWhatsApp = useCallback(() => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(
      shareText
    )}`;

    window.open(waUrl, "_blank");
  }, [shareText]);

  /* ================= COPY LINK (🔥 FIXED) ================= */

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl); // ✅ hanya URL

      alert("Link campaign berhasil disalin 🙌");
    } catch {
      alert("Gagal menyalin link");
    }
  }, [shareUrl]);

  /* ================= UI ================= */

  return (
    <div className="card space-y-3 animate-fadeUp">
      <p className="caption text-center">
        Bagikan doa ini 💚
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleWhatsApp}
          className="btn btn-primary flex-1"
        >
          Share WhatsApp
        </button>

        <button
          onClick={handleCopy}
          className="btn btn-outline flex-1"
        >
          Copy Link
        </button>
      </div>

      {/* PREVIEW LINK (optional premium touch) */}
      <div className="text-center break-all">
        <span className="caption-subtle">
          {shareUrl}
        </span>
      </div>
    </div>
  );
}

/* ================= HELPER ================= */

function buildShareText({
  message,
  campaignTitle,
  url,
}: {
  message: string;
  campaignTitle?: string;
  url: string;
}): string {
  const shortMessage =
    message.length > 120
      ? message.slice(0, 120) + "..."
      : message;

  return `Aku baru baca doa ini:\n\n"${shortMessage}"\n\nYuk bantu juga 🙏\n${campaignTitle ?? ""}\n\n${url}`;
}