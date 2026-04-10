/* ======================================================
   🔥 AFFILIATE CORE (ENTERPRISE READY)
====================================================== */

export const AFFILIATE_KEY = "affiliate_data";
export const AFFILIATE_COOKIE_KEY = "affiliate_ref";
export const AFFILIATE_EXPIRY_DAYS = 30;

const DAY = 1000 * 60 * 60 * 24;

/* ======================================================
   🧠 TYPES
====================================================== */

export type AffiliateData = {
  code: string;
  source: string;
  createdAt: number;
  expiresAt: number;
};

/* ======================================================
   🛡️ VALIDATION
====================================================== */

function isValidCode(code: string): boolean {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(code);
}

function safeParse(raw: string): AffiliateData | null {
  try {
    const parsed = JSON.parse(raw) as AffiliateData;

    if (
      !parsed.code ||
      !parsed.expiresAt ||
      !isValidCode(parsed.code)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/* ======================================================
   📦 GET AFFILIATE (CLIENT ONLY)
====================================================== */

export function getAffiliate(): AffiliateData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AFFILIATE_KEY);
    if (!raw) return null;

    const data = safeParse(raw);
    if (!data) return null;

    /* 🔥 EXPIRED */
    if (Date.now() > data.expiresAt) {
      clearAffiliate();
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/* ======================================================
   🎯 SET AFFILIATE (FIRST TOUCH)
====================================================== */

export function setAffiliate(
  code: string,
  source?: string
): void {
  if (typeof window === "undefined") return;

  const clean = code.trim();

  /* 🔥 VALIDATE */
  if (!isValidCode(clean)) return;

  /* 🔥 FIRST TOUCH LOCK */
  const existing = getAffiliate();
  if (existing) return;

  const now = Date.now();

  const data: AffiliateData = {
    code: clean,
    source: source?.trim() || "direct",
    createdAt: now,
    expiresAt: now + AFFILIATE_EXPIRY_DAYS * DAY,
  };

  /* 🔥 LOCAL STORAGE */
  localStorage.setItem(
    AFFILIATE_KEY,
    JSON.stringify(data)
  );

  /* 🔥 COOKIE SYNC (SSR SUPPORT) */
  try {
    document.cookie = `${AFFILIATE_COOKIE_KEY}=${clean}; path=/; max-age=${
      AFFILIATE_EXPIRY_DAYS * 24 * 60 * 60
    }; SameSite=Lax`;
  } catch {
    // ignore cookie errors (sandbox / strict env)
  }
}

/* ======================================================
   🧹 CLEAR
====================================================== */

export function clearAffiliate(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(AFFILIATE_KEY);

    document.cookie = `${AFFILIATE_COOKIE_KEY}=; path=/; max-age=0`;
  } catch {
    // ignore
  }
}

/* ======================================================
   🔎 HELPERS (OPTIONAL BUT USEFUL)
====================================================== */

export function getAffiliateCode(): string {
  const aff = getAffiliate();
  return aff?.code || "";
}

export function getAffiliateSource(): string {
  const aff = getAffiliate();
  return aff?.source || "direct";
}