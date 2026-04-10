"use client";

import Link, { LinkProps } from "next/link";
import { useAffiliateContext } from "./AffiliateContext";
import { useMemo } from "react";

type Props = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("//");
}

export default function SmartLink({
  href,
  children,
  className,
  ...rest
}: Props) {
  const { ref, src } = useAffiliateContext();

  const finalHref = useMemo(() => {
    if (typeof href !== "string") return href;

    /* ❌ external link → skip */
    if (isExternal(href)) return href;

    /* ❌ no affiliate → skip */
    if (!ref) return href;

    if (href.includes("ref=")) return href;

    const separator = href.includes("?") ? "&" : "?";

    return `${href}${separator}ref=${ref}&src=${src}`;
  }, [href, ref, src]);

  return (
    <Link href={finalHref} className={className} {...rest}>
      {children}
    </Link>
  );
}