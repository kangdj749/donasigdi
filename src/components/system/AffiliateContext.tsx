"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAffiliate } from "@/lib/affiliate";

type AffiliateContextType = {
  ref: string;
  src: string;
};

const AffiliateContext = createContext<AffiliateContextType>({
  ref: "",
  src: "direct",
});

export function useAffiliateContext() {
  return useContext(AffiliateContext);
}

export default function AffiliateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<AffiliateContextType>({
    ref: "",
    src: "direct",
  });

  useEffect(() => {
    const aff = getAffiliate();

    setData({
      ref: aff?.code || "",
      src: aff?.source || "direct",
    });
  }, []);

  return (
    <AffiliateContext.Provider value={data}>
      {children}
    </AffiliateContext.Provider>
  );
}