"use client";

import { useState } from "react";
import DonationDrawer from "./DonationDrawer";

/* ================= TYPES ================= */

type Props = {
  campaignId: string;
  organizationId: string;
  campaignSlug: string;
  organizationSlug: string;
  category?: string;
  affiliateCode: string | null;
};

/* ================= COMPONENT ================= */

export default function DonationSection({
  campaignId,
  organizationId,
  campaignSlug,
  organizationSlug,
  category,
  affiliateCode,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ================= STICKY CTA ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))]/90 backdrop-blur">
        <div className="container-main p-3">
          <button
            onClick={() => setOpen(true)}
            className="btn btn-primary w-full active:scale-[0.98]"
          >
            💚 Donasi Sekarang
          </button>
        </div>
      </div>

      {/* ================= DRAWER ================= */}
      {open && (
        <DonationDrawer
          campaignId={campaignId}
          organizationId={organizationId}
          campaignSlug={campaignSlug}
          organizationSlug={organizationSlug}
          category={category}
          affiliateCode={affiliateCode}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}