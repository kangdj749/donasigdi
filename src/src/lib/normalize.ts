export function normalizeWilayah(text: string): string {
  return text
    .toLowerCase()
    .replace(/kab\.?|kabupaten/g, "")
    .replace(/kota/g, "")
    .replace(/\s+/g, "")
    .trim();
}
