export interface CheckoutItem {
  id: string | number;
  name: string;
  image?: string;
  price: number;
  weight: number;
  qty: number; // wajib
  variations?: Record<string, string>;
}

export interface ShippingItem {
  id: string | number;
  name: string;
  price: number;
  weight: number;
  quantity: number; // ShippingItem pakai quantity
  image?: string;
  variations?: Record<string, string>;
}
