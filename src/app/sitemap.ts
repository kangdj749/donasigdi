import { MetadataRoute } from "next";
import { CATEGORY_MAP } from "@/lib/category";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://khadeejahijab.id";
  const now = new Date();

  /* ================= STATIC ================= */
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  /* ================= CATEGORIES ================= */
  const categoryUrls: MetadataRoute.Sitemap = Object.values(
    CATEGORY_MAP
  ).map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticUrls, ...categoryUrls];
}
