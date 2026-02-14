// utils/cache.ts

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const cacheStore = new Map<string, CacheEntry<unknown>>();

// default TTL = 5 menit
const DEFAULT_TTL = 300;

export function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = DEFAULT_TTL
) {
  const expiry = Date.now() + ttlSeconds * 1000;

  cacheStore.set(key, {
    data,
    expiry,
  });
}

export function getCache<T>(key: string): T | null {
  const entry = cacheStore.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    cacheStore.delete(key);
    return null;
  }

  return entry.data as T;
}

export function clearCache(key: string) {
  cacheStore.delete(key);
}

export function clearAllCache() {
  cacheStore.clear();
}
