"use client";

import { useState } from "react";
import { Campaign } from "@/lib/campaign.service";

type Props = {
  campaign: Campaign;
};

export default function DonationDrawer({ campaign }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);

  return (
    <>
      {/* 🔥 Sticky CTA */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 right-4 z-40 bg-primary text-white py-3 rounded-xl font-semibold shadow-lg"
      >
        Donasi Sekarang
      </button>

      {/* 🔥 Drawer */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-2xl p-5 animate-slideUp">
            <h2 className="font-semibold text-lg mb-3">
              Donasi untuk {campaign.title}
            </h2>

            <input
              type="number"
              placeholder="Masukkan nominal donasi"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              disabled={amount <= 0}
              className="mt-4 w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              Lanjut Pembayaran
            </button>

            <button
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-sm text-gray-500"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
