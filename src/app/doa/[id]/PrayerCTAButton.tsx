"use client";

import Link from "next/link";
import { getAffiliate } from "@/lib/affiliate";

type Props = {
  campaignSlug: string;
  prayerId: string;
};

export default function PrayerCTAButton({
  campaignSlug,
  prayerId,
}: Props) {
  const affiliate = getAffiliate();

  const query = new URLSearchParams();

  if (affiliate?.code) {
    query.set("ref", affiliate.code);
  }

  query.set("src", `doa_${prayerId}`);

  const href = `/campaign/${campaignSlug}?${query.toString()}`;

  return (
    <Link
      href={href}
      className="btn btn-primary w-full"
    >
      Ikut Donasi Sekarang
    </Link>
  );
}