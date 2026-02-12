/* ================= TYPES ================= */
export type OrderItem = {
  id: string | number;
  name: string;
  price: number;
  qty: number;
  weight: number;
  image?: string;
  variations?: Record<string, string>;
};

export type ShippingData = {
  courier: string;
  service: string;
  cost: number;
};

export type CustomerData = {
  name: string;
  phone: string;
  address: string;
  city: string; // ✅ TAMBAH INI
};

export type CheckoutData = {
  orderId: string;  
  customer: CustomerData;
  items: OrderItem[];
  shipping: ShippingData;
  subtotal: number;
  total_weight: number;
  total: number;
  affiliate?: string | null;
  payment_method: "whatsapp" | "midtrans";
  payment_status: "pending";
};

/* ================= FORMAT WA ================= */
export function buildWhatsAppMessage(data: CheckoutData): string {
  /* === GUARD (ANTI ERROR RUNTIME) === */
  const customer = data.customer ?? {
    name: "-",
    phone: "-",
    address: "-",
  };

  const shipping = data.shipping ?? {
    courier: "-",
    service: "-",
    cost: 0,
  };

  const items = Array.isArray(data.items) ? data.items : [];

  const itemsText =
    items.length > 0
      ? items
          .map((item, idx) => {
            const variantText =
              item.variations && Object.keys(item.variations).length > 0
                ? `Varian: ${Object.values(item.variations).join(", ")}\n`
                : "";

            const qty = Number(item.qty ?? 0);
            const price = Number(item.price ?? 0);

            return (
              `${idx + 1}. ${item.name}\n` +
              `${variantText}` +
              `Qty: ${qty}\n` +
              `Harga: Rp ${price.toLocaleString("id-ID")}\n` +
              `Subtotal: Rp ${(price * qty).toLocaleString("id-ID")}`
            );
          })
          .join("\n\n")
      : "-";

  return `
Halo admin 👋
Saya mau order ya

🆔 Order ID:
${data.orderId}

👤 Data Pembeli:
Nama: ${customer.name}
No HP: ${customer.phone}
Alamat: ${customer.address}

🛍️ Detail Pesanan:
${itemsText}

🚚 Pengiriman:
${shipping.courier.toUpperCase()} - ${shipping.service}
Ongkir: Rp ${shipping.cost.toLocaleString("id-ID")}

📦 Total Berat:
${((data.total_weight ?? 0) / 1000).toFixed(2)} kg

💰 Ringkasan:
Subtotal: Rp ${(data.subtotal ?? 0).toLocaleString("id-ID")}
Ongkir: Rp ${shipping.cost.toLocaleString("id-ID")}
TOTAL: Rp ${(data.total ?? 0).toLocaleString("id-ID")}

Terima kasih 🙏
`.trim();
}
