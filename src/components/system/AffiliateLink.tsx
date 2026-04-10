"use client";

import Link from "next/link";
import { useAffiliateContext } from "./AffiliateContext";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function AffiliateLink({
  href,
  children,
  className,
}: Props) {
  const { ref, src } = useAffiliateContext();

  const url = (() => {
    if (!ref) return href;

    const sep = href.includes("?") ? "&" : "?";

    return `${href}${sep}ref=${ref}&src=${src}`;
  })();

  return (
    <Link href={url} className={className}>
      {children}
    </Link>
  );
}