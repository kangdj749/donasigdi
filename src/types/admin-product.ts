// src/types/admin-product.ts
export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  image: string;
  gallery: string[];
  category: string;
  tags: string[];
  price: number;
  discountPrice?: number;
  shopee?: string;
  tokopedia?: string;
  tiktok?: string;
  weight: number; // gram
};

export type AdminVariation = {
  productId: string;
  variation1Name: string;
  variation1Value: string;
  variation2Name?: string;
  variation2Value?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  image?: string;
};
