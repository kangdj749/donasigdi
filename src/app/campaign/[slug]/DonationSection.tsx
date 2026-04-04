"use client";

import { useState } from "react";
import DonationDrawer from "./DonationDrawer";

type Props = {
  campaignId: string;
  affiliateCode: string | null;
};

export default function DonationSection({
  campaignId,
  affiliateCode,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sticky CTA */}
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

      {open && (
        <DonationDrawer
          campaignId={campaignId}
          affiliateCode={affiliateCode}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}