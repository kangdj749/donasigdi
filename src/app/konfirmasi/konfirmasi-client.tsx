

"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  Package,
} from "lucide-react";
import NextImage from "next/image";

/* ================= TYPES ================= */

type CheckoutProduct = {
  nama: string;
  variasi: string;
  qty: number;
  hargaSatuan: number;
  totalHarga: number;
  image: string;
};

type CheckoutData = {
  orderId: string;
  nama: string;
  nohp: string;
  alamat: string;

  courier: string;
  service: string;
  etd: string;

  subtotal: number;
  totalWeight: number; // gram
  ongkir: number;
  total: number;

  afiliasi?: string;
  produk: CheckoutProduct[];

  createdAt: string;
};

/* ================= PAGE ================= */

export default function KonfirmasiClient() {
  const router = useRouter();

  const [data, setData] = useState<CheckoutData | null>(null);
  const [status, setStatus] = useState<
    "success" | "local" | "error"
  >("local");

  const [orderStatus, setOrderStatus] =
    useState("Menunggu Pembayaran");

  const WA_ADMIN = "6281224128899";

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem("checkoutData");
      if (!raw) {
        setStatus("error");
        return;
      }

      const parsed: CheckoutData = JSON.parse(raw);

      // 🛡️ VALIDASI MINIMAL
      if (!parsed.orderId || !parsed.produk?.length) {
        setStatus("error");
        return;
      }

      setData(parsed);
      setStatus("success");
    } catch {
      setStatus("error");
    }

    // simulasi status
    const t1 = setTimeout(
      () => setOrderStatus("Sedang Diproses"),
      4000
    );
    const t2 = setTimeout(
      () => setOrderStatus("Siap Dikirim"),
      8000
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  /* ================= ERROR STATE ================= */

  if (status === "error" || !data) {
    return (
      <section className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6 text-center">
        <AlertTriangle className="w-14 h-14 text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">
          Tidak Ada Data Pesanan
        </h1>
        <p className="text-gray-600 mb-6">
          Silakan lakukan checkout terlebih dahulu.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-pink-600 text-white rounded-xl"
        >
          Kembali ke Beranda
        </button>
      </section>
    );
  }

  /* ================= WHATSAPP ================= */

  const produkText = data.produk
    .map(
      (p, i) =>
        `${i + 1}. ${p.nama} ${
          p.variasi !== "-" ? `(${p.variasi})` : ""
        } — ${p.qty}x Rp ${p.hargaSatuan.toLocaleString(
          "id-ID"
        )} = Rp ${p.totalHarga.toLocaleString("id-ID")}`
    )
    .join("\n");

  const courierLabel = data.courier
    ? data.courier.toUpperCase()
    : "EKSPEDISI";

  const pesanWA = encodeURIComponent(
    `Halo Admin 👋, saya sudah melakukan pesanan.

🧾 *Order ID:* ${data.orderId}
👤 *Nama:* ${data.nama}
📞 *No HP:* ${data.nohp}
🏠 *Alamat:* ${data.alamat}

🚚 *Pengiriman:* ${courierLabel} - ${data.service}
⏱️ *Estimasi:* ${data.etd} hari

🛍️ *Pesanan:*
${produkText}

⚖️ *Berat:* ${(data.totalWeight / 1000).toFixed(2)} kg
💰 *Subtotal:* Rp ${data.subtotal.toLocaleString("id-ID")}
🚚 *Ongkir:* Rp ${data.ongkir.toLocaleString("id-ID")}
💵 *Total:* Rp ${data.total.toLocaleString("id-ID")}

📦 *Status:* ${orderStatus}

Mohon konfirmasinya 🙏`
  );

  const waLink = `https://wa.me/${WA_ADMIN}?text=${pesanWA}`;

  /* ================= UI ================= */

  return (
    <section className="min-h-screen bg-pink-50 px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow p-6 space-y-6">

        {/* HEADER */}
        <div className="text-center">
          <CheckCircle className="w-14 h-14 text-pink-600 mx-auto mb-2" />
          <h1 className="text-xl font-bold">
            Pesanan Berhasil
          </h1>
          <p className="text-sm text-gray-600">
            Pesananmu sedang diproses
          </p>

          <div className="flex items-center justify-center gap-2 mt-2">
            {orderStatus === "Menunggu Pembayaran" && (
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
            )}
            {orderStatus === "Sedang Diproses" && (
              <Package className="w-4 h-4 text-blue-500 animate-pulse" />
            )}
            {orderStatus === "Siap Dikirim" && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm">{orderStatus}</span>
          </div>
        </div>

        {/* RINGKASAN */}
        <div className="bg-pink-100 rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span>Order ID</span>
            <span className="font-medium">{data.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span>Pengiriman</span>
            <span className="font-medium">
              {courierLabel} - {data.service}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Berat</span>
            <span>
              {(data.totalWeight / 1000).toFixed(2)} kg
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Bayar</span>
            <span className="font-bold text-pink-600">
              Rp {data.total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* PRODUK */}
        <div className="space-y-3">
          {data.produk.map((p, i) => (
            <div
              key={i}
              className="flex gap-3 border rounded-xl p-2"
            >
              <NextImage
                src={p.image}
                alt={p.nama}
                width={56}
                height={56}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="font-medium">{p.nama}</div>
                {p.variasi !== "-" && (
                  <div className="text-xs text-gray-500">
                    {p.variasi}
                  </div>
                )}
                <div className="text-sm">
                  {p.qty} × Rp{" "}
                  {p.hargaSatuan.toLocaleString("id-ID")} ={" "}
                  <span className="font-semibold">
                    Rp {p.totalHarga.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ACTION */}
        <a
          href={waLink}
          target="_blank"
          className="block bg-pink-600 text-white text-center py-3 rounded-xl font-semibold"
        >
          Hubungi Admin via WhatsApp
        </a>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-pink-100 py-3 rounded-xl font-semibold"
        >
          Kembali ke Beranda
        </button>
      </div>
    </section>
  );
}
