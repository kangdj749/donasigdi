// types/order.ts

import type { CheckoutData } from "@/lib/format-wa";

export interface PendingOrder extends CheckoutData {
  created_at: string;
  kota?: string;
  midtrans_order_id?: string;
  snap_token?: string;
}


export type OrderStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "expired";

export type OrderItem = {
  productId: string;
  variantId?: string;
  qty: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
};
