export function normalizeWilayah(text: string) {
  return text
    .toLowerCase()
    .replace(/kabupaten|kab\.|kota/g, "")
    .replace(/[^a-z]/g, "")
    .trim();
}