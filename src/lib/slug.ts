// lib/slugify.ts
export function generateSlug(name: string, maxLength = 100): string {
  let slug = name
    .toLowerCase()
    .normalize("NFD")                 // Hapus accent/diacritics
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]+/g, "-")     // semua non-alphanum jadi dash
    .replace(/^-+|-+$/g, "");        // trim dash di awal/akhir

  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength);
  }

  return slug;
}

export function slugifyCategory(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, "dan")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
