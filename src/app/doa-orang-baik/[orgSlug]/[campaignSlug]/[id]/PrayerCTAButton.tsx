"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAffiliate } from "@/lib/affiliate";

export default function PrayerCTAButton({
  campaignSlug,
  prayerId,
}: {
  campaignSlug: string;
  prayerId: string;
}) {
  const [href, setHref] = useState(
    `/campaign/${campaignSlug}?src=doa_${prayerId}`
  );

  useEffect(() => {
    const affiliate = getAffiliate();

    const ref =
      affiliate?.code ||
      localStorage.getItem("ref") ||
      "";

    const src = `doa_${prayerId}`;

    const query = new URLSearchParams();

    if (ref) query.set("ref", ref);
    query.set("src", src);

    setHref(`/campaign/${campaignSlug}?${query.toString()}`);
  }, [campaignSlug, prayerId]);

  return (
    <Link href={href} className="btn btn-primary w-full">
      Ikut Donasi Sekarang
    </Link>
  );
}