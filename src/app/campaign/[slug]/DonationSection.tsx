// app/campaign/[slug]/DonationSection.tsx

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
      <div className="fixed bottom-0 left-0 right-0 flex justify-center backdrop-blur-md bg-white/80 border-t z-40">
        <div className="w-full max-w-md p-3">
          <button
            onClick={() => setOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold active:scale-95 transition-all duration-200 shadow-lg"
          >
            Donasi Sekarang
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
