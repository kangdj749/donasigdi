"use client";

import { useEffect } from "react";

export function useAttribution() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const params = new URLSearchParams(window.location.search);

      const ref = params.get("ref");
      const src = params.get("src");

      if (ref && ref.trim()) {
        localStorage.setItem("ref", ref);
      }

      if (src && src.trim()) {
        localStorage.setItem("src", src);
      }
    } catch (err) {
      console.error("Attribution error:", err);
    }
  }, []);
}