"use client";

import { useEffect } from "react";
import { setAffiliate } from "@/lib/affiliate";

export function useAttribution() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const params = new URLSearchParams(window.location.search);

      const ref = params.get("ref");
      const src = params.get("src") || "direct";

      if (!ref) return;

      /* 🔥 FIRST TOUCH LOGIC */
      setAffiliate(ref, src);
    } catch (err) {
      console.error("Attribution error:", err);
    }
  }, []);
}