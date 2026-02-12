export type CategorySEO = {
  slug: string;
  name: string;
  description: string;
};

export const CATEGORY_MAP: Record<string, CategorySEO> = {
  fashion: {
    slug: "fashion",
    name: "Fashion Muslimah",
    description:
      "Koleksi fashion muslimah terbaru: tunik, setelan, hijab premium dengan bahan nyaman & desain elegan.",
  },
  hijab: {
    slug: "hijab",
    name: "Hijab Premium",
    description:
      "Hijab premium Khadeeja Hijab dengan bahan adem, ringan, dan elegan untuk aktivitas harian.",
  },
};
