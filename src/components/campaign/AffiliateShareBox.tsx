"use client";

import { useEffect, useMemo, useState } from "react";
import { getAffiliate } from "@/lib/affiliate";

type Props = {
  campaignSlug: string;
  campaignTitle: string;
  referralCode?: string | null;
};

export default function AffiliateShareBox({
  campaignSlug,
  campaignTitle,
  referralCode,
}: Props) {
  const [origin, setOrigin] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  /* ================= SAFE ORIGIN ================= */
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);

      const affiliate = getAffiliate();
      setAffiliateCode(affiliate?.code ?? null);
    }
  }, []);

  /* ================= BUILD SHARE URL (🔥 CORE TRACKING) ================= */
  const shareUrl = useMemo(() => {
    if (!origin || !campaignSlug) return "";

    const query = new URLSearchParams();

    const finalCode = affiliateCode || referralCode;

    if (finalCode) {
      query.set("ref", finalCode);
    }

    // 🔥 SOURCE TRACKING (IMPORTANT)
    query.set("src", `share_box_${campaignSlug}`);

    return `${origin}/campaign/${campaignSlug}?${query.toString()}`;
  }, [origin, campaignSlug, affiliateCode, referralCode]);

  /* ================= ACTIONS ================= */

  async function handleCopy(): Promise<void> {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  function handleWhatsApp(): void {
    if (!shareUrl) return;

    const text = encodeURIComponent(
      `🙏 Yuk bantu campaign ini\n\n"${campaignTitle}"\n\nKlik di sini:\n${shareUrl}`
    );

    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  /* ================= UI ================= */

  return (
    <section
      aria-label="Bagikan campaign"
      className="card space-y-5 animate-fadeUp"
    >
      {/* ================= HEADER ================= */}
      <div className="space-y-1">

        <h3 className="h3 flex items-center gap-2">
          <span className="text-primary">💚</span>
          Ajak Lebih Banyak Orang
        </h3>

        <p className="caption max-w-md">
          Semakin banyak yang tahu, semakin besar dampak yang bisa kita bantu bersama.
        </p>

      </div>

      {/* ================= URL BOX ================= */}
      <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-soft))] px-3 py-2">

        <span className="caption truncate">
          {shareUrl || "Memuat link..."}
        </span>

        <button
          onClick={handleCopy}
          disabled={!shareUrl}
          aria-label="Salin link campaign"
          className="shrink-0 caption font-medium text-primary hover:opacity-80 transition disabled:opacity-50"
        >
          {copied ? "Tersalin ✓" : "Salin"}
        </button>

      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="grid grid-cols-2 gap-3">

        <button
          onClick={handleWhatsApp}
          disabled={!shareUrl}
          className="btn btn-primary disabled:opacity-50"
        >
          📲 WhatsApp
        </button>

        <button
          onClick={handleCopy}
          disabled={!shareUrl}
          className="btn btn-outline disabled:opacity-50"
        >
          🔗 Salin Link
        </button>

      </div>

      {/* ================= MICRO FEEDBACK ================= */}
      {copied && (
        <div className="text-center">
          <span className="caption text-primary">
            Link berhasil disalin 👍
          </span>
        </div>
      )}

      {/* ================= AFFILIATE INFO (🔥 TRUST BOOST) ================= */}
      {(affiliateCode || referralCode) && (
        <div className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-soft))]">

          <span className="caption">
            Kode referral aktif
          </span>

          <span className="caption font-medium text-primary">
            #{(affiliateCode || referralCode)?.slice(0, 6)}
          </span>

        </div>
      )}

      {/* ================= TRUST NOTE ================= */}
      <div className="pt-2 border-t border-[rgb(var(--color-border))]">

        <p className="caption-subtle text-center">
          Dibagikan oleh orang baik 💚 • Setiap share sangat berarti
        </p>

      </div>

    </section>
  );
}