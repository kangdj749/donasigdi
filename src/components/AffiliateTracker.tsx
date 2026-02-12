"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setAffiliate } from "@/lib/affiliate";

export default function AffiliateTracker() {
  const params = useSearchParams();

  useEffect(() => {
    const code =
      params.get("ref") ||
      params.get("aff") ||
      params.get("affiliate");

    if (code) {
      setAffiliate(code);
    }
  }, [params]);

  return null;
}
