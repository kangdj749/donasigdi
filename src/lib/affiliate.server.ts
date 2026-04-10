import { cookies } from "next/headers";

/* ================= TYPES ================= */

export type AffiliateServerResult = {
  ref: string;
  src: string;
};

/* ================= CORE ================= */

export function getAffiliateServer(
  searchParams?: { ref?: string; src?: string }
): AffiliateServerResult {
  try {
    const cookieStore = cookies();

    const cookieRef =
      cookieStore.get("affiliate_ref")?.value ?? "";

    const ref =
      searchParams?.ref?.trim() ||
      cookieRef ||
      "";

    const src =
      searchParams?.src?.trim() ||
      "server_default";

    return { ref, src };
  } catch {
    return {
      ref: searchParams?.ref ?? "",
      src: searchParams?.src ?? "server_default",
    };
  }
}

/* ================= URL BUILDER ================= */

export function withAffiliate(
  url: string,
  ref?: string,
  src?: string
): string {
  if (!ref) return url;

  const params = new URLSearchParams();

  params.set("ref", ref);
  if (src) params.set("src", src);

  const sep = url.includes("?") ? "&" : "?";

  return `${url}${sep}${params.toString()}`;
}