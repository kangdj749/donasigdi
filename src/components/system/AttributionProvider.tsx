"use client";

import { useAttribution } from "@/hooks/useAttribution";

export default function AttributionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useAttribution();

  return <>{children}</>;
}