"use client";

import PrayerList, { Prayer } from "@/components/campaign/PrayerList";

type Props = {
  campaignId: string;
  organizationId: string;
  campaignSlug: string;
  organizationSlug: string;
  initialData: Prayer[];
};

export default function CampaignPrayersSection({
  campaignId,
  organizationId,
  campaignSlug,
  organizationSlug,
  initialData,
}: Props) {
  return (
    <section className="section">
      <PrayerList
        initialData={initialData}
        campaignId={campaignId}
        organizationId={organizationId}
        campaignSlug={campaignSlug}
        organizationSlug={organizationSlug}
      />
    </section>
  );
}