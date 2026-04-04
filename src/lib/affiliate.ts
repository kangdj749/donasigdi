// lib/affiliate.ts
export const AFFILIATE_KEY = "affiliate_data";
export const AFFILIATE_EXPIRY_DAYS = 30;

const DAY = 1000 * 60 * 60 * 24;

export type AffiliateData = {
  code: string;
  source?: string;
  createdAt: number;
  expiresAt: number;
};

function isValidCode(code: string) {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(code);
}

export function getAffiliate(): AffiliateData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AFFILIATE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as AffiliateData;

    if (!data.code || !data.expiresAt) return null;

    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(AFFILIATE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * FIRST TOUCH ONLY
 */
export function setAffiliate(code: string, source?: string) {
  if (typeof window === "undefined") return;

  const clean = code.trim();
  if (!isValidCode(clean)) return;

  const existing = getAffiliate();
  if (existing) return;

  const now = Date.now();

  const data: AffiliateData = {
    code: clean,
    source,
    createdAt: now,
    expiresAt: now + AFFILIATE_EXPIRY_DAYS * DAY,
  };

  localStorage.setItem(AFFILIATE_KEY, JSON.stringify(data));
}

export function clearAffiliate() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AFFILIATE_KEY);
}
