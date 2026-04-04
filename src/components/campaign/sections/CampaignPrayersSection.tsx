"use client";

import PrayerList, { Prayer } from "@/components/campaign/PrayerList";

/* ================= TYPES ================= */

type Props = {
  campaignId: string;
  initialData: Prayer[];
  showHeader?: boolean;
};

/* ================= COMPONENT ================= */

export default function CampaignPrayersSection({
  campaignId,
  initialData,
  showHeader = true,
}: Props) {
  return (
    <section className="section space-y-8">

      {/* ================= HEADER ================= */}
      {showHeader && (
        <div className="space-y-2 text-center max-w-lg mx-auto">

          <h2 className="h2">
            Doa & Harapan 💚
          </h2>

          <p className="caption">
            Setiap doa adalah energi kebaikan yang menyebar.
            Kamu juga bisa ikut mengaminkan 🙏
          </p>

        </div>
      )}

      {/* ================= LIST WRAPPER ================= */}
      <div className="space-y-4">

        <PrayerList
          initialData={Array.isArray(initialData) ? initialData : []}
          campaignId={campaignId}
        />

      </div>

    </section>
  );
}